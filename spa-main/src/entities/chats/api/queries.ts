import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchChats, fetchChatMessages, sendMessage, readMessages, fetchRecentChats } from "./api"
import type { ISendMessageRequest, IReadMessagesRequest, IMessage } from "../model/types"
import { USER_KEYS } from "@/entities/user/api/queries.ts"

interface UseQueryProps<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseChatsOptions {
  enabled?: boolean
}

export const useChats = (options?: UseChatsOptions) => {
  return useInfiniteQuery({
    queryKey: ["chats"],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return fetchChats(pageParam)
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_more ? lastPage.meta.next_cursor : undefined
    },
    refetchOnMount: "always",
    enabled: options?.enabled,
  })
}

export const useRecentChats = () => {
  return useInfiniteQuery({
    queryKey: ["recent-chats"],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return fetchRecentChats(pageParam)
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_more ? lastPage.meta.next_cursor : undefined
    },
    refetchOnMount: "always",
  })
}

export const useChatMessages = (chatId: string | number, currentUserId?: number) => {
  return useInfiniteQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: ({ pageParam }) => {
      return fetchChatMessages(chatId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.next_cursor ?? undefined
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.meta.prev_cursor ?? undefined
    },
    enabled: !!chatId,
    refetchOnMount: "always",
    select: (res) => {
      if (!currentUserId) return res

      const hasExistingFirstUnread = res.pages.some((page) =>
        page.data.some((msg) => msg.firstUnread),
      )

      if (hasExistingFirstUnread) {
        return res
      }

      const allMessages = res.pages.flatMap((page) => [...page.data])
      const firstUnreadMessage = allMessages.find(
        (msg) => !msg.read_at && msg.sender_id !== currentUserId,
      )

      if (!firstUnreadMessage) {
        return res
      }

      const modifiedPages = res.pages.map((page) => ({
        ...page,
        data: page.data.map((msg) =>
          msg.id === firstUnreadMessage.id ? { ...msg, firstUnread: true } : msg,
        ),
      }))

      return {
        ...res,
        pages: modifiedPages,
      }
    },
  })
}

export const useSendMessage = ({ onSuccess }: UseQueryProps<IMessage>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ISendMessageRequest) => sendMessage(data),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["chats"] })
      onSuccess?.(res)
    },
  })
}

export const useReadMessages = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IReadMessagesRequest) => readMessages(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [USER_KEYS.user, "stats"],
      })
    },
  })
}
