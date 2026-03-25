import { useInView } from "react-intersection-observer"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PageLayout } from "@/widgets"
import { MatchPageCard } from "./MatchPageCard"
import { MatchPageCardSkeleton } from "./MatchPageCardSkeleton"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useGetUserMatches, useUser, useUserStats } from "@/entities/user/api/queries.ts"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware"
import { MATCHES_SCROLL_KEY, useScrollPositionRestore } from "@/shared/lib/useScrollPositionRestore"
import { AnimatePresence } from "framer-motion"

const MatchesPageBase = ({ t }: WithTranslation) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetUserMatches()
  const { data: user } = useUser()
  const { data: stats } = useUserStats(!!user?.feed_profile)
  const keyboardAwareRef = useKeyboardAware(["TEXTAREA", "INPUT"])
  const [showEmpty, setShowEmpty] = useState(true)
  const { saveScroll } = useScrollPositionRestore(MATCHES_SCROLL_KEY, keyboardAwareRef)
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allMatches = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data])

  useEffect(() => {
    if (allMatches.length > 0) {
      setShowEmpty(false)
    }
  }, [allMatches.length])

  const handleExitComplete = useCallback(() => {
    if (allMatches.length === 0) {
      setShowEmpty(true)
    }
  }, [allMatches.length])

  const handleNavigateToProfile = useCallback(() => {
    saveScroll()
  }, [saveScroll])

  return (
    <PageLayout
      shadow={{ bottom: true, top: false }}
      className='!px-2 pb-safe-area-bottom-with-menu'
      ref={keyboardAwareRef}
    >
      <h1 className='title3-bold text-white mb-6'>
        {t("matches.title")} ({stats?.matches || 0})
      </h1>

      {isLoading ? (
        <div className='flex flex-wrap gap-[10px]'>
          {Array.from({ length: 6 }).map((_, index) => (
            <MatchPageCardSkeleton key={index} />
          ))}
        </div>
      ) : showEmpty && allMatches.length === 0 ? (
        <div className='flex items-center justify-center h-full'>
          <span className='title1-bold text-white-20'>{t("matches.empty")}</span>
        </div>
      ) : (
        <div className='flex flex-wrap gap-[10px]'>
          <AnimatePresence mode='popLayout' onExitComplete={handleExitComplete}>
            {allMatches.map((match) => (
              <MatchPageCard
                key={match.user_id}
                match={match}
                handleNavigate={handleNavigateToProfile}
              />
            ))}
          </AnimatePresence>
          {hasNextPage && (
            <div ref={ref} className='w-full py-4 flex justify-center'>
              {isFetchingNextPage && (
                <div className='flex flex-wrap gap-[10px] w-full'>
                  <MatchPageCardSkeleton />
                  <MatchPageCardSkeleton />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}

export const MatchesPage = withTranslation()(MatchesPageBase)
