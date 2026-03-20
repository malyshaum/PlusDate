import { useInView } from "react-intersection-observer"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"

import { PageLayout } from "@/widgets"
import { useChats, useRecentChats } from "@/entities/chats/api/queries"
import { MatchCard } from "@/entities/chats/ui/MatchCard"
import { MatchCardSkeleton } from "@/entities/chats/ui/MatchCardSkeleton"
import { ChatCard } from "@/entities/chats/ui/ChatCard"
import { ChatCardSkeleton } from "@/entities/chats/ui/ChatCardSkeleton"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useLikes } from "@/entities/likes"
import IconHeart from "@/shared/assets/icons/icon-heart.svg"
import { useUser, useUserStats } from "@/entities/user/api/queries.ts"
import classNames from "classnames"
import { useViewProfileMatch } from "@/features/SwipeCards/api/queries"
import {
  CHATS_SCROLL_KEY,
  MATCHES_SCROLL_KEY,
  RECENT_MATCHES_SCROLL_KEY,
  useScrollPositionRestore,
} from "@/shared/lib/useScrollPositionRestore"
import { useChatPresenceMap, type ChatPresenceInput } from "@/shared/lib/useChatPresenceMap"
import { PresenceOverrideContext } from "@/shared/ui/UserAvatar"

const ChatsBase = ({ t }: WithTranslation) => {
  const { data: user } = useUser()
  const matchesScrollRef = useRef<HTMLDivElement>(null)
  const chatsScrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data: stats } = useUserStats(!!user?.feed_profile)
  const { clearScroll } = useScrollPositionRestore(MATCHES_SCROLL_KEY)
  const { saveHorizontalScroll: saveRecentMatchesScroll } = useScrollPositionRestore(
    RECENT_MATCHES_SCROLL_KEY,
    matchesScrollRef,
    true,
  )
  const { saveScroll: saveChatsScroll } = useScrollPositionRestore(CHATS_SCROLL_KEY, chatsScrollRef)

  const { data: likesData } = useLikes()
  const {
    data: recentChatsData,
    fetchNextPage: fetchNextRecentChats,
    hasNextPage: hasNextRecentChats,
    isFetchingNextPage: isFetchingNextRecentChats,
    isLoading: isLoadingRecentChats,
  } = useRecentChats()

  const {
    data: chatsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingChats,
  } = useChats()

  const viewProfileMatchMutation = useViewProfileMatch({})

  const { ref: chatsRef, inView: chatsInView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const { ref: matchesRef, inView: matchesInView } = useInView({
    threshold: 0,
    rootMargin: "50px",
  })

  useEffect(() => {
    clearScroll()
  }, [clearScroll])

  useEffect(() => {
    if (chatsInView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [chatsInView, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (matchesInView && hasNextRecentChats && !isFetchingNextRecentChats) {
      void fetchNextRecentChats()
    }
  }, [matchesInView, hasNextRecentChats, isFetchingNextRecentChats, fetchNextRecentChats])

  const lastLike = useMemo(() => {
    return likesData?.pages[0].data[0]
  }, [likesData])

  const allRecentChats = useMemo(() => {
    return (
      recentChatsData?.pages.flatMap((page) => page.data).filter((chat) => !chat.last_message) ?? []
    )
  }, [recentChatsData])

  const allChats = useMemo(() => {
    return chatsData?.pages.flatMap((page) => page.data) ?? []
  }, [chatsData])

  const chatPresenceInputs = useMemo<ChatPresenceInput[]>(() => {
    if (!user?.id) return []
    const inputs: ChatPresenceInput[] = []
    const seen = new Set<number>()

    for (const chat of allChats) {
      const otherUser = chat.users.find((u) => u.id !== user.id)
      if (otherUser && !seen.has(chat.id)) {
        seen.add(chat.id)
        inputs.push({ chatId: chat.id, otherUserId: otherUser.id })
      }
    }

    for (const chat of allRecentChats) {
      if (!seen.has(chat.id)) {
        seen.add(chat.id)
        inputs.push({ chatId: chat.id, otherUserId: chat.user_id })
      }
    }

    return inputs
  }, [user?.id, allChats, allRecentChats])

  const presenceMap = useChatPresenceMap(chatPresenceInputs)

  const handleChatClick = useCallback(
    (chatId: number, userId: number) => {
      void navigate(`/chat/${chatId}?userId=${userId}`)
    },
    [navigate],
  )

  const navigateToLikes = useCallback(() => {
    void navigate(`/likes`)
  }, [navigate])

  const isLoading = isLoadingRecentChats || isLoadingChats
  const hasMatches = allRecentChats && allRecentChats.length > 0
  const hasChats = allChats.filter((chat) => chat.latest_message).length > 0

  return (
    <PresenceOverrideContext.Provider value={presenceMap}>
      <PageLayout
        ref={chatsScrollRef}
        shadow={{ bottom: true, top: false }}
        className={classNames("!px-2 pb-safe-area-bottom-with-menu", {
          "flex flex-col": !hasChats,
        })}
      >
        {(isLoading || hasMatches) && (
          <>
            <div className='flex items-center justify-between'>
              <h2 className='title3-bold mb-4'>{t("chats.newMatches")}</h2>
              <Link to='/matches' className='body-regular text-white-50'>
                {t("all")} ({stats?.matches || 0})
              </Link>
            </div>
            <div
              className={!isLoading ? "flex gap-4 mb-5 overflow-x-auto items-end" : ""}
              ref={matchesScrollRef}
            >
              {isLoading ? (
                <div className='flex gap-4 mb-5 overflow-x-auto items-end'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MatchCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  {lastLike?.user && (
                    <div>
                      <MatchCard
                        user={lastLike?.user}
                        blurred={true}
                        className='border-accent border-2 rounded-full overflow-hidden w-[72px] h-[72px] flex items-center justify-center relative'
                        onClick={navigateToLikes}
                      >
                        <div className='flex justify-center items-center bg-accent rounded-[44px] px-[6px] py-[2px] absolute top-1/2 left-1/2 -translate-1/2 gap-[2px]'>
                          <img src={IconHeart} alt='' height={8} width={9} />
                          <span className='button-main'>{stats?.unresolved_likes}</span>
                        </div>
                      </MatchCard>
                    </div>
                  )}
                  {allRecentChats.map((chat) => {
                    return (
                      <MatchCard
                        key={chat.id}
                        userId={chat.user_id}
                        user_name={chat.user_name}
                        url={chat.url}
                        isViewed={chat.is_viewed}
                        onClick={() => {
                          viewProfileMatchMutation.mutate(chat.user_id)
                          handleChatClick(chat.id, chat.user_id)
                          saveRecentMatchesScroll()
                        }}
                      />
                    )
                  })}
                  {hasNextRecentChats && (
                    <div ref={matchesRef} className='flex-shrink-0'>
                      {isFetchingNextRecentChats && <MatchCardSkeleton />}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {(hasChats || isLoading) && <h2 className='title3-bold mb-4'>{t("chats.chats")}</h2>}
        {isLoading ? (
          <div className='flex flex-col gap-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <ChatCardSkeleton key={index} />
            ))}
          </div>
        ) : !hasChats ? (
          <div className='flex-1 h-full flex flex-col items-center justify-center text-center'>
            <h3 className='title1-bold text-white-20 mb-2'>{t("chats.empty.title")}</h3>
            <div className='w-7/12'>
              <p className='body-regular text-white-20'>{t("chats.empty.subtitle")}</p>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {user?.id &&
              allChats
                .filter((chat) => chat.latest_message)
                .map((chat) => (
                  <div key={chat.id} onClick={saveChatsScroll}>
                    <ChatCard chat={chat} currentUserId={user.id} />
                  </div>
                ))}

            {hasNextPage && (
              <div ref={chatsRef} className='w-full'>
                {isFetchingNextPage && (
                  <div className='flex flex-col gap-3'>
                    <ChatCardSkeleton />
                    <ChatCardSkeleton />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </PageLayout>
    </PresenceOverrideContext.Provider>
  )
}

export const Chats = withTranslation()(ChatsBase)
