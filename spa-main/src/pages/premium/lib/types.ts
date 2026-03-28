import type { Dayjs } from "dayjs"
import type { IStripeSubscription, ITelegramSubscription, Range } from "@/pages/premium/model/types"

export type SubscriptionType = "stripe" | "telegram"

export type Step = "offers" | "payment"

export interface SubscriptionData {
  stripe: IStripeSubscription | null
  telegram: ITelegramSubscription | null
}

export interface ActiveSubscription {
  type: SubscriptionType
  data: IStripeSubscription | ITelegramSubscription
  endDate: Dayjs
}

export interface SubscriptionInfo {
  type: SubscriptionType
  diffInDays: number
  endsToday: boolean
  endDate: Dayjs
  plan: Range | null
  isCanceled: boolean
}
