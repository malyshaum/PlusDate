import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react"
import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import classNames from "classnames"
import type { SwipeCardProps } from "../../model/types"
import maskStyles from "../MaskedCard/MaskedCard.module.css"
import { SwipeCardTopControls } from "@/features/SwipeCards/ui/SwipeCardTopControls"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import IconSwipeLike from "@/shared/assets/icons/icon-swipe-like-floating.svg"
import IconSwipeDislike from "@/shared/assets/icons/icon-swipe-dislike-floating.svg"
import IconAttention from "@/shared/assets/icons/premium/icon-attention.svg"
import { SwipeActions } from "../SwipeActions"
import { useUser } from "@/entities/user/api/queries"
import { useSwipeFeedStore } from "../../model/store"
import { FeedCard } from "@/features/SwipeCards/ui/FeedCard"
import { useVideoSoundToggle } from "@/shared/lib/useVideoSoundToggle"

export interface SwipeCardRef {
  triggerSwipe: (direction: "left" | "right") => void
  triggerSuperlike: () => void
  triggerRevert: () => void
}

const SWIPE_THRESHOLD = 100
const VELOCITY_THRESHOLD = 300
const EXIT_X = 500

const SPRING_CONFIG = {
  stiffness: 450,
  damping: 35,
  mass: 0.6,
}

const SwipeCardComponent = forwardRef<SwipeCardRef, SwipeCardProps>(
  (
    {
      poolIndex,
      profile,
      isTop,
      isExited = false,
      onSwipe,
      onLimitFailed,
      onDragStateChange,
      userLimits,
      disabled = false,
      onRevert,
      topCardDragProgress,
    },
    ref,
  ) => {
    const { triggerImpact } = useHapticFeedback()
    const { data: user } = useUser()
    const isAnimating = useSwipeFeedStore((state) => state.isAnimating)
    const setIsAnimating = useSwipeFeedStore((state) => state.setIsAnimating)
    const setIsDragging = useSwipeFeedStore((state) => state.setIsDragging)
    const pressedCardId = useSwipeFeedStore((state) => state.pressedCardId)
    const isDraggingStore = useSwipeFeedStore((state) => state.isDragging)
    const { setIsMuted } = useVideoSoundToggle()

    const isAnimatingRef = useRef(false)

    useEffect(() => {
      return () => {
        if (isAnimatingRef.current) {
          useSwipeFeedStore.getState().setIsAnimating(false)
        }
      }
    }, [])

    const isDragging = useRef(false)
    const isTopRef = useRef(isTop)
    isTopRef.current = isTop
    const disabledRef = useRef(disabled)
    disabledRef.current = disabled
    const mountedAsExited = useRef(isExited)

    const rawX = useMotionValue(0)
    const x = useSpring(rawX, SPRING_CONFIG)

    useLayoutEffect(() => {
      if (mountedAsExited.current) {
        rawX.jump(-EXIT_X)
        x.jump(-EXIT_X)
      }
    }, [rawX, x])
    const y = useMotionValue(0)
    const rotateZ = useTransform(x, [-300, 300], [-8, 8])

    const overlayOpacity = useTransform(x, (latest) => {
      if (!isDragging.current) return 0
      return Math.min(Math.abs(latest) / 200, 1) * 0.4
    })

    const superlikeOpacity = useTransform(y, [0, -150], [0, 1])
    const superlikeIconScale = useTransform(y, [0, -150], [0.5, 1])

    const dislikeIconX = useTransform(x, [0, -250], [-300, 0])
    const dislikeIconScale = useTransform(x, [0, -250], [0.4, 1])
    const dislikeIconOpacity = useTransform(x, [-250, -100, 0], [1, 0.4, 0])
    const likeIconX = useTransform(x, [0, 250], [300, 0])
    const likeIconScale = useTransform(x, [0, 250], [0.4, 1])
    const likeIconOpacity = useTransform(x, [0, 100, 250], [0, 0.4, 1])

    const cardScale = useTransform(topCardDragProgress, (progress) => {
      if (poolIndex === 0 || poolIndex === -1) return 1
      return Math.max(1 - poolIndex * 0.05, 0.8) + progress * 0.05
    })

    useLayoutEffect(() => {
      if (!isTop) return

      topCardDragProgress.set(Math.min(Math.abs(rawX.get()) / 200, 1))

      return rawX.on("change", (latest) => {
        const progress = Math.min(Math.abs(latest) / 200, 1)
        topCardDragProgress.set(progress)
      })
    }, [isTop, rawX, topCardDragProgress])

    const handleDragStart = useCallback(() => {
      if (useSwipeFeedStore.getState().isAnimating) return
      isDragging.current = true
      setIsDragging(true)
      onDragStateChange?.(true)
    }, [onDragStateChange, setIsDragging])

    const handleDrag = useCallback(
      (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
        if (useSwipeFeedStore.getState().isAnimating) return
        rawX.set(info.offset.x)
      },
      [rawX],
    )

    const handleDragEnd = useCallback(
      (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
        isDragging.current = false
        setIsDragging(false)
        onDragStateChange?.(false)

        if (useSwipeFeedStore.getState().isAnimating) {
          return
        }

        const { offset, velocity } = info
        const isSwipe =
          Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD

        if (!isSwipe) {
          animate(rawX, 0, { type: "spring", ...SPRING_CONFIG })
          return
        }

        const direction = offset.x > 0 ? "right" : "left"

        if (direction === "right" && userLimits.likes <= 0) {
          onLimitFailed("like-limit")
          animate(rawX, 0, { type: "spring", ...SPRING_CONFIG })
          return
        }

        triggerImpact()
        document.querySelectorAll("video").forEach((v) => {
          v.muted = true
          setIsMuted(true)
        })
        isAnimatingRef.current = true
        setIsAnimating(true)
        const exitX = direction === "right" ? EXIT_X : -EXIT_X
        void animate(rawX, exitX, { type: "tween", duration: 0.25, ease: "easeOut" })
          .then(() => {
            onSwipe(profile.feed_profile.id, direction === "right" ? "like" : "dislike")
          })
          .catch(() => {})
          .finally(() => {
            isAnimatingRef.current = false
            setIsAnimating(false)
          })
      },
      [
        rawX,
        userLimits.likes,
        onLimitFailed,
        onSwipe,
        profile.feed_profile.id,
        onDragStateChange,
        setIsAnimating,
        setIsDragging,
        triggerImpact,
        setIsMuted,
      ],
    )

    const triggerSwipe = useCallback(
      (direction: "left" | "right") => {
        const state = useSwipeFeedStore.getState()
        if (!isTopRef.current || disabledRef.current || state.isAnimating) return

        triggerImpact()
        document.querySelectorAll("video").forEach((v) => {
          v.muted = true
          setIsMuted(true)
        })
        isAnimatingRef.current = true
        setIsAnimating(true)
        const exitX = direction === "right" ? EXIT_X : -EXIT_X
        void animate(rawX, exitX, { type: "tween", duration: 0.25, ease: "easeOut" })
          .then(() => {
            onSwipe(profile.feed_profile.id, direction === "right" ? "like" : "dislike")
          })
          .catch(() => {})
          .finally(() => {
            isAnimatingRef.current = false
            setIsAnimating(false)
          })
      },
      [rawX, onSwipe, profile.feed_profile.id, setIsAnimating, triggerImpact, setIsMuted],
    )

    const triggerSuperlike = useCallback(() => {
      const state = useSwipeFeedStore.getState()
      if (!isTopRef.current || disabledRef.current || state.isAnimating) return

      document.querySelectorAll("video").forEach((v) => {
        v.muted = true
        setIsMuted(true)
      })
      isAnimatingRef.current = true
      setIsAnimating(true)
      void animate(y, -800, { type: "tween", duration: 1, ease: "easeOut" })
        .then(() => {
          onSwipe(profile.feed_profile.id, "superlike")
        })
        .catch(() => {})
        .finally(() => {
          isAnimatingRef.current = false
          setIsAnimating(false)
        })
    }, [y, onSwipe, profile.feed_profile.id, setIsAnimating, setIsMuted])

    const triggerRevert = useCallback(() => {
      void animate(x, 0, { type: "tween", duration: 0.2, ease: "easeOut" }).then(() => {
        rawX.jump(0)
      })
    }, [rawX, x])

    useImperativeHandle(ref, () => ({ triggerSwipe, triggerSuperlike, triggerRevert }), [
      triggerSwipe,
      triggerSuperlike,
      triggerRevert,
    ])

    const canDrag = isTop && !disabled

    return (
      <>
        <motion.div
          className={classNames(
            "absolute inset-0",
            canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default pointer-events-none",
          )}
          data-pool-index={poolIndex}
          data-profile-id={profile.feed_profile.id}
          data-is-exited={isExited}
          data-is-top={isTop}
          style={{
            x,
            y,
            rotateZ,
            zIndex: isExited ? 11 : 10 - poolIndex,
            scale: cardScale,
            willChange: "transform",
          }}
          drag={canDrag ? "x" : false}
          dragElastic={0}
          dragMomentum={false}
          dragListener={false}
          onPanStart={canDrag ? handleDragStart : undefined}
          onPan={canDrag ? handleDrag : undefined}
          onPanEnd={canDrag ? handleDragEnd : undefined}
        >
          <div
            className={classNames("relative w-full h-full transform-gpu", maskStyles.maskedCard)}
            style={{ contain: "layout style paint" }}
          >
            <FeedCard user={profile} isOnCooldown={userLimits.is_on_cooldown} isTop={isTop} />

            <motion.div
              className='absolute inset-0 bg-black z-25 pointer-events-none'
              style={{ opacity: overlayOpacity }}
            />
            <motion.div
              className='absolute bottom-0 left-0 w-full h-1/2 pointer-events-none z-20'
              style={{
                background:
                  "radial-gradient(102.97% 100.97% at 50% 100%, #FEAC47 0%, rgba(226, 95, 39, 0) 100%)",
                opacity: superlikeOpacity,
              }}
            />
            <motion.img
              src={IconAttention}
              alt=''
              className='absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-20 h-20'
              style={{ scale: superlikeIconScale, opacity: superlikeOpacity }}
            />

            {!userLimits.is_on_cooldown && (pressedCardId !== profile.feed_profile.id || isDraggingStore) && (
              <>
                <SwipeCardTopControls onRevert={onRevert} />

                <div className='absolute left-3 right-3 bottom-3 z-40'>
                  <SwipeActions
                    onSwipe={triggerSwipe}
                    onSuperlike={triggerSuperlike}
                    onLimitFailed={onLimitFailed}
                    userLimits={userLimits}
                    disabled={disabled || isAnimating}
                    user={user}
                  />
                </div>
              </>
            )}
          </div>

          <motion.img
            src={IconSwipeDislike}
            className='absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 w-16 h-16'
            style={{ x: dislikeIconX, scale: dislikeIconScale, opacity: dislikeIconOpacity }}
          />
          <motion.img
            src={IconSwipeLike}
            className='absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 w-16 h-16'
            style={{ x: likeIconX, scale: likeIconScale, opacity: likeIconOpacity }}
          />
        </motion.div>
      </>
    )
  },
)

export const SwipeCard = memo(SwipeCardComponent, (prev, next) => {
  return (
    prev.profile === next.profile &&
    prev.isTop === next.isTop &&
    prev.disabled === next.disabled &&
    prev.poolIndex === next.poolIndex &&
    prev.isExited === next.isExited &&
    prev.userLimits.is_on_cooldown === next.userLimits.is_on_cooldown &&
    prev.userLimits.likes === next.userLimits.likes &&
    prev.userLimits.superlikes === next.userLimits.superlikes
  )
})
