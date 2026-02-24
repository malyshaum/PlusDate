import IconPremium from "@/shared/assets/icons/premium/icon-attention.svg"
import IconRevertBig from "@/shared/assets/icons/icon-revert-big.svg"
import type { SwipeActionFailedReason } from "@/features/SwipeCards/model/types.ts"

export const reasonIcons: Record<SwipeActionFailedReason, string> = {
  "like-limit": IconPremium,
  "dislike-limit": IconPremium,
  "superlike-limit": IconPremium,
  "revert-limit": IconRevertBig,
  "superlike-disabled": IconPremium,
}
