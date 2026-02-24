import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, memo } from "react"
import { useMotionValue } from "framer-motion"
import { SwipeCard, type SwipeCardRef } from "../SwipeCard"
import type { SwipeActionFailedReason, SwipeResult } from "../../model/types"
import type { IUser, IUserLimits } from "@/entities/user/model/types.ts"
import { useSwipeFeedStore } from "../../model/store"
import { EmptyProfilesState } from "../EmptyProfilesState"

interface SwipeCardStackProps {
  profiles: IUser[]
  currentIndex: number
  onSwipe: (profileId: number, result: SwipeResult) => void
  onLimitFailed: (reason: SwipeActionFailedReason) => void
  onDragStateChange?: (isDragging: boolean) => void
  userLimits: IUserLimits
  onRevert?: () => void
  className?: string
}

export interface SwipeCardStackRef {
  triggerTopCardSwipe: (direction: "left" | "right") => void
  triggerTopCardSuperlike: () => void
  triggerRevert: () => void
}

const SwipeCardStackComponent = forwardRef<SwipeCardStackRef, SwipeCardStackProps>(
  (
    {
      profiles,
      currentIndex,
      onSwipe,
      onLimitFailed,
      onDragStateChange,
      userLimits,
      onRevert,
      className = "",
    },
    ref,
  ) => {
    const topCardRef = useRef<SwipeCardRef>(null)
    const exitedCardRef = useRef<SwipeCardRef>(null)
    const topCardDragProgress = useMotionValue(0)

    const triggerTopCardSwipe = useCallback((direction: "left" | "right") => {
      topCardRef.current?.triggerSwipe(direction)
    }, [])

    const triggerTopCardSuperlike = useCallback(() => {
      topCardRef.current?.triggerSuperlike()
    }, [])

    const triggerRevert = useCallback(() => {
      topCardRef.current?.triggerRevert()
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        triggerTopCardSwipe,
        triggerTopCardSuperlike,
        triggerRevert,
      }),
      [triggerTopCardSwipe, triggerTopCardSuperlike, triggerRevert],
    )

    const canRevert = useSwipeFeedStore((state) => state.canRevert)
    const visibleProfiles = useMemo(() => {
      const start = canRevert ? Math.max(0, currentIndex - 1) : currentIndex
      const end = start + 3
      return profiles.slice(start, end)
    }, [profiles, currentIndex, canRevert])

    const handleSwipe = useCallback(
      (profileId: number, result: SwipeResult) => {
        onSwipe(profileId, result)
      },
      [onSwipe],
    )

    if (
      (visibleProfiles.length === 0 || currentIndex >= profiles.length) &&
      !userLimits.is_on_cooldown
    ) {
      return <EmptyProfilesState />
    }

    return (
      <div
        className={`relative w-full h-full ${className}`}
        style={{ touchAction: "none", userSelect: "none" }}
      >
        {visibleProfiles.map((profile, arrayIndex) => {
          const startIndex = canRevert ? Math.max(0, currentIndex - 1) : currentIndex
          const profileIndex = startIndex + arrayIndex
          const poolIndex = profileIndex - currentIndex
          const isExited = poolIndex === -1
          const isTop = poolIndex === 0

          return (
            <SwipeCard
              key={profile.id}
              ref={isExited ? exitedCardRef : isTop ? topCardRef : null}
              poolIndex={poolIndex}
              profile={profile}
              isTop={isTop}
              isExited={isExited}
              onSwipe={handleSwipe}
              onLimitFailed={onLimitFailed}
              onDragStateChange={onDragStateChange}
              userLimits={userLimits}
              disabled={isExited}
              onRevert={onRevert}
              topCardDragProgress={topCardDragProgress}
            />
          )
        })}
      </div>
    )
  },
)

export const SwipeCardStack = memo(SwipeCardStackComponent, (prev, next) => {
  return (
    prev.currentIndex === next.currentIndex &&
    prev.profiles === next.profiles &&
    prev.userLimits === next.userLimits &&
    prev.className === next.className
  )
})
