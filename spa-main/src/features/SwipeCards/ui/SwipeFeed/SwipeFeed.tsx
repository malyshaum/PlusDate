import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import classNames from "classnames"
import { useQueryClient } from "@tanstack/react-query"
import { SwipeCardStack, type SwipeCardStackRef } from "../SwipeCardStack"
import { FEED_QUERY_KEYS, useRevertDislike, useSwipeFeed, useSwipeProfile } from "../../api/queries"
import type { Match, SwipeActionFailedReason, SwipeResult } from "../../model/types"
import { useSwipeFeedStore } from "../../model/store"
import type { IUser } from "@/entities/user/model/types.ts"
import { Button } from "@/shared/ui"
import { createPortal } from "react-dom"
import { SwipeMatch } from "@/features/SwipeCards"
import { useUser, useUserLimits } from "@/entities/user/api/queries.ts"
import { ActionLimitModal } from "@/features/SwipeCards/ui/ActionLimitModal"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { withTranslation, type WithTranslation } from "react-i18next"
import { Timeout } from "@/features/SwipeCards/ui/Timeout/Timeout.tsx"
import {
  SEARCH_PREFERENCES_SCROLL_KEY,
  useScrollPositionRestore,
} from "@/shared/lib/useScrollPositionRestore"
import maskStyles from "@/features/SwipeCards/ui/MaskedCard/MaskedCard.module.css"

interface Props extends WithTranslation {
  className?: string
}

const SwipeFeedBase = ({ className, t }: Props) => {
  const { data: user } = useUser()
  const queryClient = useQueryClient()
  const [match, setMatch] = useState<Match | null>()
  const { triggerImpact } = useHapticFeedback()
  const [actionFailedReason, setActionFailedReason] = useState<SwipeActionFailedReason | null>(null)
  const { clearScroll } = useScrollPositionRestore(SEARCH_PREFERENCES_SCROLL_KEY)

  const currentIndex = useSwipeFeedStore((state) => state.currentIndex)
  const isResettingFilters = useSwipeFeedStore((state) => state.isResettingFilters)
  const setCanRevert = useSwipeFeedStore((state) => state.setCanRevert)
  const clearRevertState = useSwipeFeedStore((state) => state.clearRevertState)
  const setCurrentIndex = useSwipeFeedStore((state) => state.setCurrentIndex)
  const setIsResettingFilters = useSwipeFeedStore((state) => state.setIsResettingFilters)
  const pendingDislike = useSwipeFeedStore((state) => state.pendingDislike)
  const setPendingDislike = useSwipeFeedStore((state) => state.setPendingDislike)

  const { data: userLimitsData, refetch: refetchUserLimits } = useUserLimits()

  const swipeStackRef = useRef<SwipeCardStackRef>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [hasCheckedOnMount, setHasCheckedOnMount] = useState(false)
  const [isWaitingForFreshData, setIsWaitingForFreshData] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isLoading, isError } =
    useSwipeFeed()

  const swipeProfileMutation = useSwipeProfile()
  const revertDislikeMutation = useRevertDislike()

  const allProfilesRef = useRef<IUser[]>([])

  const allProfiles = useMemo(() => {
    if (!data?.pages) return allProfilesRef.current

    allProfilesRef.current = data.pages.flatMap((page) => page.data)

    return allProfilesRef.current
  }, [data])

  useEffect(() => {
    const remainingCards = allProfiles.length - currentIndex
    if (remainingCards <= 5 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [currentIndex, allProfiles.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (isResettingFilters && allProfiles.length > 0 && !isFetching) {
      setCurrentIndex(0)
      clearRevertState()
      setIsResettingFilters(false)
    }
  }, [
    isResettingFilters,
    allProfiles.length,
    isFetching,
    setCurrentIndex,
    clearRevertState,
    setIsResettingFilters,
  ])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    clearScroll()
  }, [clearScroll])

  useEffect(() => {
    if (!pendingDislike || allProfiles.length === 0) return

    const topProfile = allProfiles[currentIndex]
    if (topProfile?.id === pendingDislike) {
      const timeout = setTimeout(() => {
        swipeStackRef.current?.triggerTopCardSwipe("left")
        setPendingDislike(null)
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      setPendingDislike(null)
    }
  }, [pendingDislike, allProfiles, currentIndex, setPendingDislike])

  useEffect(() => {
    if (hasCheckedOnMount || isLoading) return

    const hasVisibleProfiles = currentIndex < allProfiles.length

    if (!hasVisibleProfiles && !isFetching && !hasNextPage) {
      setIsWaitingForFreshData(true)
      void queryClient.invalidateQueries({
        queryKey: FEED_QUERY_KEYS.profiles(),
      })

      setCurrentIndex(0)
      clearRevertState()
    }

    setHasCheckedOnMount(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedOnMount, isLoading])

  useEffect(() => {
    if (isWaitingForFreshData && !isFetching) {
      setIsWaitingForFreshData(false)
    }
  }, [isWaitingForFreshData, isFetching])

  const handleLimitFailed = useCallback((reason: SwipeActionFailedReason) => {
    setActionFailedReason(reason)
  }, [])

  const handleSwipe = useCallback(
    (profileId: number, result: SwipeResult) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      if (controller.signal.aborted) {
        return
      }

      const newIndex: number = currentIndex + 1
      setCurrentIndex(newIndex)

      if (result === "dislike") {
        setCanRevert(true)
      } else {
        clearRevertState()
      }

      swipeProfileMutation.mutate(
        {
          profileId,
          action: result,
        },
        {
          onSuccess: (res) => {
            setMatch(res)

            if (result === "dislike" && res.swipe_id) {
              setCanRevert(true, res.swipe_id)
            }
          },
          onSettled: () => {
            if (abortControllerRef.current === controller) {
              abortControllerRef.current = null
            }
          },
        },
      )
    },
    [currentIndex, swipeProfileMutation, setCurrentIndex, setCanRevert, clearRevertState],
  )

  const handleRevert = useCallback(() => {
    const storeState = useSwipeFeedStore.getState()
    const { canRevert, lastDislikeSwipeId, currentIndex } = storeState

    if (!user?.is_premium) {
      triggerImpact("heavy")
      handleLimitFailed("revert-limit")
      return
    }

    if (!canRevert || !lastDislikeSwipeId || currentIndex <= 0) {
      return
    }

    const revertedProfile = allProfiles[currentIndex - 1]
    if (!revertedProfile) {
      return
    }

    triggerImpact()

    storeState.clearRevertState()
    storeState.setCurrentIndex(currentIndex - 1)

    requestAnimationFrame(() => {
      swipeStackRef.current?.triggerRevert()
    })

    revertDislikeMutation.mutate(
      { swipeId: lastDislikeSwipeId },
      {
        onError: (error) => {
          console.error("Revert failed:", error)
          storeState.setCurrentIndex(currentIndex)
        },
      },
    )
  }, [user?.is_premium, allProfiles, triggerImpact, revertDislikeMutation, handleLimitFailed])

  const revertCard = useCallback(() => {
    triggerImpact("medium")
    handleRevert()
  }, [handleRevert, triggerImpact])

  const closeMatch = useCallback(() => {
    setMatch(null)
  }, [])

  const showTimeout = useMemo(() => {
    return userLimitsData?.is_on_cooldown
  }, [userLimitsData])

  const handleTimeoutComplete = useCallback(async () => {
    await refetchUserLimits()
    await queryClient.invalidateQueries({
      queryKey: FEED_QUERY_KEYS.profiles(),
    })
  }, [refetchUserLimits, queryClient])

  const hasVisibleProfiles = currentIndex < allProfiles.length

  if (
    isLoading ||
    (isResettingFilters && isFetching) ||
    (isFetching && !hasVisibleProfiles) ||
    !hasCheckedOnMount ||
    isWaitingForFreshData ||
    !userLimitsData
  ) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <motion.div
            className='w-12 h-12 border-b-2 border-accent rounded-full mx-auto mb-4'
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className='bod-regular text-white-50'>{t("swipe.loading.text")}</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center px-4'>
          <p className='title1-bold text-attention mb-4'>Oops! Something went wrong</p>
          <Button onClick={() => window.location.reload()} className='mx-auto'>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames("relative h-full flex flex-col touch-none select-none", className)}>
      <div className='flex-1'>
        <div className={classNames("relative max-w-md mx-auto h-full", maskStyles.maskedCard)}>
          {showTimeout && (
            <Timeout
              timeout={userLimitsData?.cooldown_ends_at}
              onComplete={handleTimeoutComplete}
              showBorder={!!allProfiles.length}
            />
          )}

          <div className='h-full'>
            {userLimitsData && (
              <SwipeCardStack
                ref={swipeStackRef}
                profiles={allProfiles}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                onLimitFailed={handleLimitFailed}
                userLimits={userLimitsData}
                onRevert={revertCard}
                className='h-full'
              />
            )}
          </div>
        </div>
      </div>

      {createPortal(
        <ActionLimitModal
          isOpen={!!actionFailedReason}
          onClick={() => setActionFailedReason(null)}
          actionFailedReason={actionFailedReason}
        />,
        document.body,
      )}

      {match?.matched &&
        createPortal(
          <SwipeMatch matchUser={match.user} onClose={closeMatch} chat={match.chat} />,
          document.body,
        )}
    </div>
  )
}

export const SwipeFeed = withTranslation()(SwipeFeedBase)
