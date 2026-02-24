import { useCallback, memo } from "react"
import classNames from "classnames"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import IconHeart from "@/shared/assets/icons/icon-heart-default.svg"
import IconStar from "@/shared/assets/icons/icon-star.svg"
import type { SwipeDirection, SwipeActionFailedReason } from "../../model/types"
import { SwipeButton } from "@/shared/ui"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { IUser, IUserLimits } from "@/entities/user/model/types.ts"

interface SwipeActionsProps {
  onSwipe: (direction: SwipeDirection) => void
  onSuperlike: () => void
  onLimitFailed: (reason: SwipeActionFailedReason) => void
  userLimits: IUserLimits
  disabled?: boolean
  className?: string
  user?: IUser
}

const SwipeActionsComponent = ({
  onSwipe,
  onSuperlike,
  onLimitFailed,
  userLimits,
  disabled = false,
  className = "",
  user,
}: SwipeActionsProps) => {
  const { triggerImpact } = useHapticFeedback()

  const handleDislike = useCallback(() => {
    if (disabled) return
    onSwipe("left")
  }, [disabled, onSwipe])

  const handleSuperlike = useCallback(() => {
    if (disabled) return
    triggerImpact("heavy")
    if (!user?.is_premium) {
      onLimitFailed("superlike-disabled")
      return
    }
    if (userLimits.superlikes <= 0) {
      onLimitFailed("superlike-limit")
      return
    }
    onSuperlike()
  }, [disabled, userLimits.superlikes, onSuperlike, onLimitFailed, triggerImpact, user?.is_premium])

  const handleLike = useCallback(() => {
    if (disabled) return
    if (userLimits.likes <= 0) {
      onLimitFailed("like-limit")
      return
    }
    onSwipe("right")
  }, [disabled, userLimits.likes, onSwipe, onLimitFailed])

  return (
    <div className={classNames("flex justify-center items-center gap-2 ", className)}>
      <SwipeButton type='grey' onClick={handleDislike}>
        <img src={IconClose} alt='dislike' />
      </SwipeButton>

      <SwipeButton type='yellow' onClick={handleSuperlike}>
        <img src={IconStar} alt='superlike' />
      </SwipeButton>

      <SwipeButton type='cta' onClick={handleLike}>
        <img src={IconHeart} alt='like' />
      </SwipeButton>
    </div>
  )
}

export const SwipeActions = memo(SwipeActionsComponent, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    prev.userLimits.likes === next.userLimits.likes &&
    prev.userLimits.superlikes === next.userLimits.superlikes &&
    prev.className === next.className &&
    prev.onSwipe === next.onSwipe &&
    prev.onSuperlike === next.onSuperlike
  )
})
