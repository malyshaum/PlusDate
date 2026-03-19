import { useEffect, useState } from "react"
import { useCentrifugeContext } from "@/shared/sockets"

export function useChatPresence(chatId: string | undefined, otherUserId: number | undefined) {
  const { getClient, isConnected } = useCentrifugeContext()
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)

  useEffect(() => {
    if (!chatId || !otherUserId || !isConnected) {
      setIsOtherUserOnline(false)
      return
    }

    const client = getClient()
    if (!client) return

    const channelName = `chat:${chatId}`
    const otherUserIdStr = String(otherUserId)
    const subscription = client.newSubscription(channelName)

    subscription.on("subscribed", () => {
      subscription
        .presence()
        .then((result) => {
          const clients = result.clients
          const isPresent = Object.values(clients).some((info) => info.user === otherUserIdStr)
          setIsOtherUserOnline(isPresent)
        })
        .catch(() => {
          setIsOtherUserOnline(false)
        })
    })

    subscription.on("join", (ctx) => {
      if (ctx.info.user === otherUserIdStr) {
        setIsOtherUserOnline(true)
      }
    })

    subscription.on("leave", (ctx) => {
      if (ctx.info.user === otherUserIdStr) {
        setIsOtherUserOnline(false)
      }
    })

    subscription.subscribe()

    return () => {
      subscription.unsubscribe()
      client.removeSubscription(subscription)
    }
  }, [chatId, otherUserId, isConnected, getClient])

  return { isOtherUserOnline }
}
