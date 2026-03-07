import { useEffect, useRef, useState, useCallback } from "react"
import { Centrifuge, type Subscription, type PublicationContext } from "centrifuge"
import { getCentrifugoToken } from "@/entities/user/api/user.api.ts"
import { env } from "@/shared/config/env"
import { useUser } from "@/entities/user/api/queries.ts"
import { CentrifugeContext } from "./centrifugeContextValue"

type EventCallback = (data: unknown) => void

interface CentrifugeProviderProps {
  children: React.ReactNode
}

export const CentrifugeProvider = ({ children }: CentrifugeProviderProps) => {
  const { data: user } = useUser()
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<Centrifuge | null>(null)
  const subscriptionRef = useRef<Subscription | null>(null)
  const listenersRef = useRef<Map<string, Set<EventCallback>>>(new Map())

  const subscribe = useCallback((event: string, callback: EventCallback): (() => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event)!.add(callback)

    return () => {
      const eventListeners = listenersRef.current.get(event)
      if (eventListeners) {
        eventListeners.delete(callback)
        if (eventListeners.size === 0) {
          listenersRef.current.delete(event)
        }
      }
    }
  }, [])

  const getClient = useCallback(() => clientRef.current, [])

  const handlePublication = useCallback((ctx: PublicationContext) => {
    const eventData = ctx.data as { event?: string; data?: unknown }
    const eventName = eventData?.event
    const data = eventData?.data

    if (!eventName) {
      console.warn("[Centrifuge] Received publication without event name:", ctx.data)
      return
    }

    const eventListeners = listenersRef.current.get(eventName)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[Centrifuge] Error in event handler for "${eventName}":`, error)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    const initCentrifuge = async () => {
      try {
        const { token } = await getCentrifugoToken()

        if (!isMounted) return

        const centrifuge = new Centrifuge(env.socket.wsUrl, {
          token,
          getToken: async () => {
            const { token: newToken } = await getCentrifugoToken()
            return newToken
          },
        })

        clientRef.current = centrifuge

        centrifuge.on("connected", () => {
          if (isMounted) {
            setIsConnected(true)
            console.log("[Centrifuge] Connected")
          }
        })

        centrifuge.on("disconnected", () => {
          if (isMounted) {
            setIsConnected(false)
            console.log("[Centrifuge] Disconnected")
          }
        })

        centrifuge.on("error", (ctx) => {
          console.error("[Centrifuge] Error:", ctx)
        })

        const channelName = `#${user.id}`
        const subscription = centrifuge.newSubscription(channelName)
        subscriptionRef.current = subscription

        subscription.on("publication", handlePublication)
        subscription.on("subscribed", () => {
          console.log(`[Centrifuge] Subscribed to channel: ${channelName}`)
        })
        subscription.on("error", (ctx) => {
          console.error(`[Centrifuge] Subscription error for ${channelName}:`, ctx)
        })

        subscription.subscribe()
        centrifuge.connect()
      } catch (error) {
        console.error("[Centrifuge] Failed to initialize:", error)
      }
    }

    void initCentrifuge()

    return () => {
      isMounted = false

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }

      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }

      setIsConnected(false)
    }
  }, [user?.id, handlePublication])

  return (
    <CentrifugeContext.Provider value={{ isConnected, subscribe, getClient }}>
      {children}
    </CentrifugeContext.Provider>
  )
}
