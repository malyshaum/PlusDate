import { dayjs } from "@/shared/lib/date"
import type { IStripeSubscription, ITelegramSubscription, Range } from "@/pages/premium/model/types"
import type {
  SubscriptionData,
  ActiveSubscription,
  SubscriptionInfo,
} from "@/pages/premium/lib/types"

export const isStripeActive = (
  stripe: IStripeSubscription | null | undefined,
): stripe is IStripeSubscription => {
  return !!stripe && (stripe.stripe_status === "active" || stripe.stripe_status === "trialing")
}

export const getCurrentPlan = (activeSubscription: ActiveSubscription | null): Range | null => {
  if (!activeSubscription?.data) return null

  if (activeSubscription.type === "telegram") {
    return (activeSubscription.data as ITelegramSubscription).plan
  }

  return (activeSubscription.data as IStripeSubscription).type
}

export const getSubscriptionInfo = (
  activeSubscription: ActiveSubscription | null,
): SubscriptionInfo | null => {
  if (!activeSubscription?.data) return null

  const now = dayjs()
  const endDate = activeSubscription.endDate
  const diffInDays = endDate.startOf("day").diff(now.startOf("day"), "day")
  const endsToday = endDate.isSame(now, "day")

  const isCanceled =
    activeSubscription.type === "stripe" &&
    !!(activeSubscription.data as IStripeSubscription).ends_at

  return {
    type: activeSubscription.type,
    diffInDays,
    endsToday,
    endDate,
    plan:
      activeSubscription.type === "telegram"
        ? (activeSubscription.data as ITelegramSubscription).plan
        : null,
    isCanceled,
  }
}

export const getActiveSubscription = (
  subscription: SubscriptionData | undefined,
): ActiveSubscription | null => {
  if (!subscription?.stripe && !subscription?.telegram) {
    return null
  }

  const { stripe, telegram } = subscription
  const hasActiveStripe = isStripeActive(stripe)
  const stripeEndDate = stripe?.ends_at ? dayjs(stripe.ends_at) : null
  const telegramEndDate = telegram?.active_until ? dayjs(telegram.active_until) : null

  if (hasActiveStripe && !stripeEndDate) {
    return {
      type: "stripe",
      data: stripe,
      endDate: dayjs().add(30, "days"),
    }
  }

  if (stripeEndDate && telegramEndDate && stripe && telegram) {
    const isStripeLonger = stripeEndDate.isAfter(telegramEndDate)
    return {
      type: isStripeLonger ? "stripe" : "telegram",
      data: isStripeLonger ? stripe : telegram,
      endDate: isStripeLonger ? stripeEndDate : telegramEndDate,
    }
  }

  if (stripeEndDate && stripe) {
    return { type: "stripe", data: stripe, endDate: stripeEndDate }
  }

  if (telegramEndDate && telegram) {
    return { type: "telegram", data: telegram, endDate: telegramEndDate }
  }

  return null
}
