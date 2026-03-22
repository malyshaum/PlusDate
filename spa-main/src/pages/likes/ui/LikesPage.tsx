import { LIKES_SCROLL_KEY, useScrollPositionRestore } from "@/shared/lib/useScrollPositionRestore"
import { useInView } from "react-intersection-observer"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { PageLayout } from "@/widgets"
import { SwipeMatch } from "@/features/SwipeCards"
import type { Match } from "@/features/SwipeCards/model/types"
import { useLikes } from "@/entities/likes/api/queries"
import { LikeCard } from "@/entities/likes/ui/LikeCard"
import { LikeCardSkeleton } from "@/entities/likes/ui/LikeCardSkeleton"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useUser, useUserStats } from "@/entities/user/api/queries.ts"
import { useRespondToLikeMutation } from "@/entities/likes/api/queries.ts"
import { useViewProfileMatch } from "@/features/SwipeCards/api/queries"
import IconCrownWhite from "@/shared/assets/icons/icon-crown-white.svg?react"
import IconChevronRight from "@/shared/assets/icons/icon-chevron-right.svg?react"
import { ButtonLink } from "@/shared/ui"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { useToast } from "@/shared/lib/useToast.ts"
import classNames from "classnames"
import type { SwipeAction } from "@/features/SwipeCards/model/types"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware"

const LikesPageBase = ({ t }: WithTranslation) => {
  const keyboardAwareRef = useKeyboardAware(["TEXTAREA", "INPUT"])
  const { saveScroll } = useScrollPositionRestore(LIKES_SCROLL_KEY, keyboardAwareRef)
  const { data: user } = useUser()
  const sendUserEvent = useUserGTMEvent()
  const navigate = useNavigate()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useLikes(false)
  const { data: stats } = useUserStats(!!user?.feed_profile)
  const [match, setMatch] = useState<Match | null>(null)
  const [showEmpty, setShowEmpty] = useState(true)
  const { showToast } = useToast()
  const pendingActionRef = useRef<{ action: SwipeAction; isLastCard: boolean } | null>(null)

  const viewProfileMatchMutation = useViewProfileMatch({})
  const respondToLikeMutation = useRespondToLikeMutation({
    onSuccess: (data) => {
      const pending = pendingActionRef.current
      pendingActionRef.current = null

      if (!data.matched || !data.user) return
      if (pending?.action === "like" && pending.isLastCard) {
        setMatch(data)
      } else if (pending?.action === "like") {
        showToast({
          text: "newMatch",
          imageUrl: data.user.files.find((f) => f.type === "image" && f.is_main)?.url,
          onClick: () => {
            viewProfileMatchMutation.mutate(data.user.id)
            void navigate(`/chat/${data.chat.id}?userId=${data.user.id}`)
          },
        })
      }
    },
  })

  const closeMatch = useCallback(() => {
    setMatch(null)
    void navigate("/feed")
  }, [navigate])

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (!user?.is_premium) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: {
          creative_name: "unlock_likes_banner",
          creative_slot: "likes_page_bottom",
          location_id: "likes_page",
          promotion_id: "UNLOCK_LIKES",
          promotion_name: "Разблокировка лайков",
          items: [{ promotion_id: "other", promotion_name: "other" }],
        },
      })
    }
  }, [user?.is_premium, sendUserEvent])

  const allLikes = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data])

  const handleAction = useCallback(
    (params: { profileId: number; action: SwipeAction; userId: number }) => {
      pendingActionRef.current = {
        action: params.action,
        isLastCard: allLikes.length === 1,
      }
      respondToLikeMutation.mutate(params)
    },
    [allLikes.length, respondToLikeMutation],
  )

  const handleNavigateToProfile = useCallback(() => {
    saveScroll()
  }, [saveScroll])

  useEffect(() => {
    if (allLikes.length > 0) {
      setShowEmpty(false)
    }
  }, [allLikes.length])

  const handleExitComplete = useCallback(() => {
    if (allLikes.length === 0) {
      setShowEmpty(true)
    }
  }, [allLikes.length])

  return (
    <>
      <PageLayout
        shadow={{ bottom: true, top: false }}
        className='!px-2 pb-safe-area-bottom-with-menu'
        ref={keyboardAwareRef}
      >
        <h1 className='title3-bold text-white mb-6'>
          {t("likes.title")} ({stats?.unresolved_likes})
        </h1>

        {isLoading ? (
          <div
            className={classNames("flex flex-wrap gap-[10px]", {
              "pb-[76px]": !user?.is_premium,
            })}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <LikeCardSkeleton key={index} showActions={user?.is_premium} />
            ))}
          </div>
        ) : showEmpty && allLikes.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <span className='title1-bold text-white-20'>{t("likes.empty")}</span>
          </div>
        ) : (
          <div
            className={classNames("flex flex-wrap gap-[10px] relative", {
              "pb-[76px]": !user?.is_premium,
            })}
          >
            <AnimatePresence mode='popLayout' onExitComplete={handleExitComplete}>
              {allLikes.map((like) => (
                <LikeCard
                  key={like.id}
                  user={like.user}
                  action={like.action}
                  onAction={handleAction}
                  isActionPending={respondToLikeMutation.isPending}
                  onNavigateToProfile={handleNavigateToProfile}
                />
              ))}
            </AnimatePresence>

            {hasNextPage && (
              <div ref={ref} className='w-full py-4 flex justify-center'>
                {isFetchingNextPage && (
                  <div className='flex flex-wrap gap-[10px] w-full'>
                    <LikeCardSkeleton showActions={user?.is_premium} />
                    <LikeCardSkeleton showActions={user?.is_premium} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!user?.is_premium && (
          <div
            onClick={() =>
              sendUserEvent({
                event: "select_promotion",
                ecommerce: {
                  creative_name: "unlock_likes_banner",
                  creative_slot: "likes_page_bottom",
                  location_id: "likes_page",
                  promotion_id: "UNLOCK_LIKES",
                  promotion_name: "Разблокировка лайков",
                  items: [{ promotion_id: "other", promotion_name: "other" }],
                },
              })
            }
          >
            <ButtonLink
              to='/premium'
              variant='accent'
              icon={<IconCrownWhite />}
              rightElement={<IconChevronRight />}
              className='!absolute w-[calc(100%-16px)] z-32'
              style={{
                bottom:
                  "calc(var(--tg-viewport-safe-area-inset-bottom, 20px) + 72px + var(--safe-padding))",
              }}
            >
              <span className='block body-bold'>{t("premium.getPremium")}</span>
              <span className='block subtitle-medium mt-1'>{t("premium.discount70")}</span>
            </ButtonLink>
          </div>
        )}
      </PageLayout>

      {match?.matched &&
        allLikes.length === 0 &&
        createPortal(
          <SwipeMatch
            matchUser={match.user}
            onClose={closeMatch}
            chat={match.chat}
            closeButtonLabel='match.goToFeed'
          />,
          document.body,
        )}
    </>
  )
}

export const LikesPage = withTranslation()(LikesPageBase)
