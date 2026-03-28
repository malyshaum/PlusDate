import type { Range } from "@/pages/premium/model/types.ts"
import HeartAnimation from "@/../public/animations/PD_em2.json"
import superlikeAnimationIcon from "@/../public/animations/PD_em3.json"
import premiumAnimation from "@/../public/animations/PD_em8.json"
import VideoAnimation from "@/../public/animations/PD_em6.json"
import revertAnimationIcon from "@/../public/animations/PD_em5.json"
import IconSpb from "@/shared/assets/icons/premium/icon-spb.svg"
import IconStar from "@/shared/assets/icons/premium/icon-star.svg"
import IconCard from "@/shared/assets/icons/premium/icon-card.svg"
import CardsAnimation from "@/../public/animations/pd_ic4cards.json"
import ConfidentialAnimation from "@/../public/animations/pd_ic3conf.json"
import InstagramAnimation from "@/../public/animations/pd_ic1inst.json"
import FiltersAnimation from "@/../public/animations/pd_ic2filters.json"

interface Plan {
  range: Range
  titleKey: string
  subtitleKey?: string
  periodNumber: number
  priceDollar: number
  priceStar: number
  priceDiscount?: number
  stickyLabel?: string
}

export const plans: Plan[] = [
  {
    range: "three_days",
    titleKey: "premium.plans.3days.title",
    periodNumber: 3,
    priceDollar: 1.89,
    priceStar: 140,
  },
  {
    range: "week",
    titleKey: "premium.plans.1week.title",
    subtitleKey: "premium.plans.1week.subtitle",
    periodNumber: 1,
    priceDollar: 4.49,
    priceStar: 290,
    priceDiscount: 340,
  },
  {
    range: "month",
    titleKey: "premium.plans.month.title",
    subtitleKey: "premium.plans.month.subtitle",
    periodNumber: 1,
    priceDollar: 6.99,
    priceStar: 490,
    priceDiscount: 1400,
  },
  {
    range: "three_month",
    titleKey: "premium.plans.3month.title",
    subtitleKey: "premium.plans.3month.subtitle",
    periodNumber: 3,
    priceDollar: 14.99,
    priceStar: 1300,
    priceDiscount: 4400,
  },
]

export const sliderItems = [
  {
    animationData: HeartAnimation,
    titleKey: "premium.features.whoLikedYou.title",
    subtitleKey: "premium.features.whoLikedYou.subtitle",
  },
  {
    animationData: premiumAnimation,
    titleKey: "premium.features.vip.title",
    subtitleKey: "premium.features.vip.subtitle",
    style: { filter: "brightness(0) invert(1)" },
  },
  {
    animationData: CardsAnimation,
    titleKey: "premium.features.swipes.title",
    subtitleKey: "premium.features.swipes.subtitle",
  },
  {
    animationData: superlikeAnimationIcon,
    titleKey: "premium.features.moreAttention.title",
    subtitleKey: "premium.features.moreAttention.subtitle",
  },
  {
    animationData: VideoAnimation,
    titleKey: "premium.features.video.title",
    subtitleKey: "premium.features.video.subtitle",
  },
  {
    animationData: revertAnimationIcon,
    titleKey: "premium.features.revert.title",
    subtitleKey: "premium.features.revert.subtitle",
    style: { filter: "brightness(0) invert(1)" },
  },
  {
    animationData: FiltersAnimation,
    titleKey: "premium.features.advancedFilters.title",
    subtitleKey: "premium.features.advancedFilters.subtitle",
  },
  {
    animationData: InstagramAnimation,
    titleKey: "premium.features.instagramProfile.title",
    subtitleKey: "premium.features.instagramProfile.subtitle",
  },
  {
    animationData: ConfidentialAnimation,
    titleKey: "premium.features.privacy.title",
    subtitleKey: "premium.features.privacy.subtitle",
  },
]

export type PaymentMethod = "spb" | "stars" | "card"

export interface Payment {
  id: PaymentMethod
  icon: string
  titleKey: string
  subtitleKey: string
}

export const payments: Payment[] = [
  {
    id: "spb",
    icon: IconSpb,
    titleKey: "premium.paymentMethods.spb.title",
    subtitleKey: "premium.paymentMethods.spb.subtitle",
  },
  {
    id: "stars",
    icon: IconStar,
    titleKey: "premium.paymentMethods.stars.title",
    subtitleKey: "premium.paymentMethods.stars.subtitle",
  },
  {
    id: "card",
    icon: IconCard,
    titleKey: "premium.paymentMethods.card.title",
    subtitleKey: "premium.paymentMethods.card.subtitle",
  },
]

export const getInitialSlideIndex = (type?: string | null) => {
  if (type === "rewind") return 5
  if (type === "superlike") return 3
  if (type === "video") return 4
  if (type === "filters") return 6
  if (type === "instagram") return 7
  return 0
}
