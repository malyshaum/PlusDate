import { useCallback } from "react"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import type { IMessage, IChat } from "@/entities/chats/model/types"
import { useMessageEvent, useMessageReadEvent } from "@/shared/sockets"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

interface ChatMessagesResponse {
  data: IMessage[]
  meta: {
    cursor?: string
    has_more?: boolean
    next_cursor?: string
    prev_cursor?: string
    total?: number
  }
}

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

export const useChatSocket = (chatId?: string, currentUserId?: number) => {
  const queryClient = useQueryClient()
  const { triggerImpact } = useHapticFeedback()

  const addMessageToCache = useCallback(
    (newMessage: IMessage) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
        ["chat-messages", chatId],
        (oldData) => {
          triggerImpact()
          if (!oldData) return oldData

          const messageExists = oldData.pages.some((page) =>
            page.data.some((msg) => msg.id === newMessage.id),
          )

          if (messageExists) {
            return oldData
          }

          const newPages = [...oldData.pages]

          const lastPageIndex = newPages.length - 1
          if (lastPageIndex >= 0) {
            newPages[lastPageIndex] = {
              ...newPages[lastPageIndex],
              data: [newMessage, ...newPages[lastPageIndex].data].sort((a, b) => a.id - b.id),
            }
          } else {
            newPages.push({
              data: [newMessage],
              meta: {
                has_more: false,
              },
            })
          }

          return {
            ...oldData,
            pages: newPages,
          }
        },
      )
    },
    [chatId, queryClient],
  )

  const markMessagesAsRead = useCallback(
    (messageId: number) => {
      const currentTime = new Date().toISOString()

      queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
        ["chat-messages", chatId],
        (oldData) => {
          if (!oldData) return oldData

          const newPages = oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((message) =>
              message.id <= messageId && !message.read_at
                ? { ...message, read_at: currentTime }
                : message,
            ),
          }))

          return {
            ...oldData,
            pages: newPages,
          }
        },
      )

      queryClient.setQueryData<InfiniteData<ChatsResponse>>(["chats"], (oldData) => {
        if (!oldData) return oldData

        const newPages = oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((chat) =>
            chat.id === parseInt(chatId || "")
              ? {
                  ...chat,
                  unread_count: 0,
                  latest_message: chat.latest_message
                    ? { ...chat.latest_message, read_at: currentTime }
                    : null,
                }
              : chat,
          ),
        }))

        return {
          ...oldData,
          pages: newPages,
        }
      })
    },
    [chatId, queryClient],
  )

  useMessageEvent(
    currentUserId,
    useCallback(
      (data: IMessage) => {
        if (data?.id && data?.chat_id === parseInt(chatId || "")) {
          addMessageToCache(data)
        }
      },
      [chatId, addMessageToCache],
    ),
  )

  useMessageReadEvent(
    currentUserId,
    useCallback(
      (data: { message_id: number; chat_id: number }) => {
        if (data?.chat_id === parseInt(chatId || "")) {
          markMessagesAsRead(data.message_id)
        }
      },
      [chatId, markMessagesAsRead],
    ),
  )

  return { addMessageToCache }
}
