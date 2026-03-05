import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useCentrifugeContext } from "@/shared/sockets"
import type { Subscription } from "centrifuge"

export interface ChatPresenceInput {
  chatId: number
  otherUserId: number
}

const MAX_SUBSCRIPTIONS = 50

export function useChatPresenceMap(inputs: ChatPresenceInput[]): Map<number, boolean> {
  const { getClient, isConnected } = useCentrifugeContext()
  const [presenceMap, setPresenceMap] = useState<Map<number, boolean>>(() => new Map())
  const subscriptionsRef = useRef<Map<number, Subscription>>(new Map())
  const inputsRef = useRef<ChatPresenceInput[]>(inputs)
  inputsRef.current = inputs

  const inputsKey = useMemo(
    () => inputs.slice(0, MAX_SUBSCRIPTIONS).map((i) => i.chatId).join(","),
    [inputs],
  )

  const updatePresence = useCallback((userId: number, online: boolean) => {
    setPresenceMap((prev) => {
      if (prev.get(userId) === online) return prev
      const next = new Map(prev)
      next.set(userId, online)
      return next
    })
  }, [])

  useEffect(() => {
    if (!isConnected) return

    const client = getClient()
    if (!client) return

    const capped = inputs.slice(0, MAX_SUBSCRIPTIONS)
    const desiredChatIds = new Set(capped.map((i) => i.chatId))
    const userByChatId = new Map(capped.map((i) => [i.chatId, i.otherUserId]))

    // Remove subscriptions no longer needed
    for (const [chatId, sub] of subscriptionsRef.current) {
      if (!desiredChatIds.has(chatId)) {
        sub.unsubscribe()
        client.removeSubscription(sub)
        subscriptionsRef.current.delete(chatId)
      }
    }

    // Add new subscriptions
    for (const { chatId, otherUserId } of capped) {
      if (subscriptionsRef.current.has(chatId)) continue

      const channelName = `chat:${chatId}`
      const otherUserIdStr = String(otherUserId)
      const subscription = client.newSubscription(channelName)

      subscription.on("subscribed", () => {
        subscription
          .presence()
          .then((result) => {
            const isPresent = Object.values(result.clients).some(
              (info) => info.user === otherUserIdStr,
            )
            updatePresence(otherUserId, isPresent)
          })
          .catch(() => {
            updatePresence(otherUserId, false)
          })
      })

      subscription.on("join", (ctx) => {
        const uid = userByChatId.get(chatId)
        if (uid !== undefined && ctx.info.user === String(uid)) {
          updatePresence(uid, true)
        }
      })

      subscription.on("leave", (ctx) => {
        const uid = userByChatId.get(chatId)
        if (uid !== undefined && ctx.info.user === String(uid)) {
          updatePresence(uid, false)
        }
      })

      subscription.subscribe()
      subscriptionsRef.current.set(chatId, subscription)
    }

    const currentSubscriptions = subscriptionsRef.current

    return () => {
      const c = getClient()
      for (const [, sub] of currentSubscriptions) {
        sub.unsubscribe()
        if (c) c.removeSubscription(sub)
      }
      currentSubscriptions.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, getClient, updatePresence, inputsKey])

  return presenceMap
}
