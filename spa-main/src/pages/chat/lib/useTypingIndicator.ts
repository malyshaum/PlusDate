import { useCallback, useEffect, useRef, useState } from "react"
import { useCentrifugeContext } from "@/shared/sockets"
import type { PublicationContext, Subscription } from "centrifuge"

const TYPING_THROTTLE_MS = 3000
const TYPING_TIMEOUT_MS = 4000

export function useTypingIndicator(chatId: string | undefined, otherUserId: number | undefined) {
  const { getClient, isConnected } = useCentrifugeContext()
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const lastPublishRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const subRef = useRef<Subscription | null>(null)
  const isPublishingRef = useRef(false)

  useEffect(() => {
    if (!chatId || !otherUserId || !isConnected) {
      setIsOtherUserTyping(false)
      return
    }

    const client = getClient()
    if (!client) return

    // Reuse subscription created by useChatPresence
    const subscription = client.getSubscription(`chat:${chatId}`)
    if (!subscription) return

    subRef.current = subscription

    const handlePublication = (ctx: PublicationContext) => {
      if (isPublishingRef.current) return

      const data = ctx.data as { type?: string } | undefined
      if (data?.type === "typing") {
        setIsOtherUserTyping(true)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false)
        }, TYPING_TIMEOUT_MS)
      }
    }

    subscription.on("publication", handlePublication)

    return () => {
      subscription.removeListener("publication", handlePublication)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsOtherUserTyping(false)
      subRef.current = null
    }
  }, [chatId, otherUserId, isConnected, getClient])

  const publishTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastPublishRef.current < TYPING_THROTTLE_MS) return

    const sub = subRef.current
    if (!sub) return

    isPublishingRef.current = true
    sub
      .publish({ type: "typing" })
      .catch(() => {
        // Silently ignore publish errors
      })
      .finally(() => {
        isPublishingRef.current = false
      })
    lastPublishRef.current = now
  }, [])

  const resetTyping = useCallback(() => {
    setIsOtherUserTyping(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return { isOtherUserTyping, publishTyping, resetTyping }
}
