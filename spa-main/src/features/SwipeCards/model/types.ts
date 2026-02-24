import type { IUser, IUserLimits } from "@/entities/user/model/types"
import type { IChat } from "@/entities/chats"
import type { MotionValue } from "framer-motion"

export type SwipeDirection = "left" | "right"
export type SwipeAction = "like" | "dislike" | "superlike" | "revert"
export type SwipeResult = SwipeAction
export type SwipeActionFailedReason =
  | "like-limit"
  | "dislike-limit"
  | "superlike-limit"
  | "revert-limit"
  | "superlike-disabled"

export interface SwipeFeedState {
  canRevert: boolean
  lastDislikeSwipeId: number | null
  currentIndex: number
  isResettingFilters: boolean
  pressedCardId: number | null
  isAnimating: boolean
  isDragging: boolean
  pendingDislike: number | null
  isVideoMuted: boolean
}

export interface SwipeCardProps {
  poolIndex: number
  profile: IUser
  isTop: boolean
  isExited?: boolean
  onSwipe: (profileId: number, result: SwipeResult) => void
  onLimitFailed: (reason: SwipeActionFailedReason) => void
  onDragStateChange?: (isDragging: boolean) => void
  userLimits: IUserLimits
  disabled?: boolean
  onRevert?: () => void
  onOpenFilters?: () => void
  topCardDragProgress: MotionValue<number>
}

export interface SwipeGestureConfig {
  swipeThreshold: number
  velocityThreshold: number
  rotationMultiplier: number
  scaleStep: number
}

export interface Match {
  matched: boolean
  user: IUser
  chat: IChat
  swipe_id?: number
}
