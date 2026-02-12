import React, { useRef, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import {
  useExternalUser,
  useOnlineFriends,
  USER_KEYS,
  useUser,
} from "@/entities/user/api/queries.ts"
import { useToast } from "@/shared/lib/useToast.ts"
import type {
  MatchCreatedEventData,
  PremiumFailedEventData,
  PremiumGrantedEventData,
} from "@/shared/types/socket-events"
import type { IChat, IMessage } from "@/entities/chats/model/types"
import { LIKES_QUERY_KEY, STATS_QUERY_KEY } from "@/entities/likes"
import type { ILike } from "@/entities/likes/model/types"
import type { IUserMatch, IUserStats } from "@/entities/user/model/types.ts"
import type { ChatCreatedEventData } from "@/shared/types/socket-events"
import { prependToInfiniteQuery } from "@/shared/lib/queryHelpers"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { ISocketMessage } from "@/entities/chats/model/types.ts"
import { CentrifugeProvider, useCentrifugeEvent } from "@/shared/sockets"
import { useViewProfileMatch } from "@/features/SwipeCards/api/queries"
import { usePaymentModal } from "@/shared/lib/usePaymentModal"
import { SUBSCRIPTION_KEYS } from "@/pages/premium/api/query.ts"

interface ChatsResponse {
  data: IChat[]
  meta: {
    cursor?: string
    has_more?: boolean
    next_cursor?: string
    prev_cursor?: string
    total?: number
  }
}

interface Props {
  children: React.ReactNode
}

const GlobalEventHandlers = () => {
  const queryClient = useQueryClient()
  const { data: user, refetch } = useUser()
  const { refetch: meRefetch } = useExternalUser(user?.id)
  const viewProfileMatchMutation = useViewProfileMatch({})
  const location = useLocation()
  const locationRef = useRef(location)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { triggerNotification, triggerImpact } = useHapticFeedback()

  // Global online status polling - runs every 30 seconds
  useOnlineFriends()

  useEffect(() => {
    locationRef.current = location
  }, [location])

  const handleModerationStatusUpdated = useCallback(async () => {
    await refetch()
    await meRefetch()
    triggerNotification("success")
  }, [refetch, meRefetch, triggerNotification])

  const handlePhotoModerationResult = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleUserMatch = useCallback(
    (data: MatchCreatedEventData) => {
      triggerNotification("success")

      queryClient.setQueryData<IUserStats>([...STATS_QUERY_KEY], (old) =>
        old
          ? { ...old, matches: old.matches + 1, unviewed_matches: old.unviewed_matches + 1 }
          : old,
      )

      if (data.profile) {
        const newMatch: IUserMatch = {
          user_id: data.profile.user_id,
          profile_id: data.profile.profile_id,
          user_name: data.profile.user_name,
          is_premium: data.profile.is_premium,
          age: data.profile.age,
          created_at: data.profile.created_at,
          chat_id: data.profile.chat_id,
          is_viewed: data.profile.is_viewed,
          url: data.photo_url,
        }

        prependToInfiniteQuery<IUserMatch>(
          queryClient,
          [USER_KEYS.user, USER_KEYS.allMatches],
          newMatch,
        )
      }

      showToast({
        text: "newMatch",
        imageUrl: data.photo_url,
        onClick: () => {
          viewProfileMatchMutation.mutate(data.user_id)
          void navigate(`/chat/${data.chat_id}?userId=${data.user_id}`)
        },
      })
    },
    [triggerNotification, queryClient, showToast, navigate, viewProfileMatchMutation],
  )

  const handleMessageReceived = useCallback(
    (data: ISocketMessage) => {
      queryClient.setQueryData<InfiniteData<ChatsResponse>>(["chats"], (oldData) => {
        if (!oldData) return oldData
        const currentTime = new Date().toISOString()
        const newMessage: IMessage = {
          id: data.id,
          chat_id: data.chat_id,
          sender_id: data.sender_id,
          message: data.message,
          sent_at: currentTime,
          read_at: null,
          created_at: currentTime,
          updated_at: currentTime,
        }

        let updatedChat: IChat | null = null
        const newPages = oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((chat) => {
            if (chat.id === data.chat_id) {
              updatedChat = {
                ...chat,
                latest_message: newMessage,
                unread_count:
                  locationRef.current.pathname === `/chat/${data.chat_id}`
                    ? chat.unread_count
                    : chat.unread_count + 1,
                updated_at: currentTime,
              }
              return false
            }
            return true
          }),
        }))

        if (updatedChat && newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            data: [updatedChat, ...newPages[0].data],
          }
        }

        return {
          ...oldData,
          pages: newPages,
        }
      })

      if (locationRef.current.pathname !== `/chat/${data.chat_id}`) {
        triggerImpact()

        queryClient.setQueryData<IUserStats>([...STATS_QUERY_KEY], (old) =>
          old ? { ...old, unread_chats: old.unread_chats + 1 } : old,
        )

        showToast({
          text: data.name,
          imageUrl: data.photo_url,
          note: data.message,
          onClick: () => {
            void navigate(`/chat/${data.chat_id}?userId=${data.sender_id}`)
          },
        })
      }
    },
    [queryClient, triggerImpact, showToast, navigate],
  )

  const handleReceivedLike = useCallback(
    (data: ILike) => {
      triggerNotification("success")

      prependToInfiniteQuery(queryClient, [...LIKES_QUERY_KEY], data)

      queryClient.setQueryData<IUserStats>([...STATS_QUERY_KEY], (old) =>
        old ? { ...old, unresolved_likes: old.unresolved_likes + 1 } : old,
      )

      if (locationRef.current.pathname !== "/likes") {
        showToast({
          text: "newLike",
          onClick: () => {
            void navigate("/likes")
          },
        })
      }
    },
    [triggerNotification, queryClient, showToast, navigate],
  )

  const { showPaymentModal } = usePaymentModal()

  const handlePremiumGranted = useCallback(
    async (data: PremiumGrantedEventData) => {
      localStorage.removeItem("pending_payment")
      localStorage.removeItem("pending_payment_range")
      await queryClient.refetchQueries({ queryKey: [USER_KEYS.user, USER_KEYS.me] })
      await queryClient.refetchQueries({
        queryKey: [SUBSCRIPTION_KEYS.subscription, SUBSCRIPTION_KEYS.current],
      })
      triggerNotification("success")
      showPaymentModal("success", data.subscription_type)
    },
    [queryClient, triggerNotification, showPaymentModal],
  )

  const handleSubscriptionFailed = useCallback(
    (data: PremiumFailedEventData) => {
      localStorage.removeItem("pending_payment")
      localStorage.removeItem("pending_payment_range")
      triggerNotification("error")
      showPaymentModal("error", data.subscription_type)
    },
    [triggerNotification, showPaymentModal],
  )

  const handleChatCreated = useCallback(
    (data: ChatCreatedEventData) => {
      prependToInfiniteQuery<IChat>(queryClient, ["chats"], {
        ...data.chat,
        unread_count: 0,
        latest_message: null,
      })
    },
    [queryClient],
  )

  useCentrifugeEvent("moderation.status.updated", handleModerationStatusUpdated)
  useCentrifugeEvent("photo.moderation.result", handlePhotoModerationResult)
  useCentrifugeEvent<MatchCreatedEventData>("user.match", handleUserMatch)
  useCentrifugeEvent<ISocketMessage>("message.received", handleMessageReceived)
  useCentrifugeEvent<ILike>("user.received_like", handleReceivedLike)
  useCentrifugeEvent("premium.granted", handlePremiumGranted)
  useCentrifugeEvent("subscription.failed", handleSubscriptionFailed)
  useCentrifugeEvent<ChatCreatedEventData>("chat.created", handleChatCreated)

  return null
}

export function SocketProvider({ children }: Props) {
  return (
    <CentrifugeProvider>
      <GlobalEventHandlers />
      {children}
    </CentrifugeProvider>
  )
}
