import { useCallback } from "react"
import type { IMessage } from "@/entities/chats"
import { useCentrifugeEvent } from "./useCentrifugeEvent"

export const useMessageEvent = (
  currentUserId?: number,
  callback?: (data: IMessage) => void,
) => {
  const handleMessage = useCallback(
    (data: IMessage) => {
      if (!currentUserId || !callback) return
      callback(data)
    },
    [currentUserId, callback],
  )

  useCentrifugeEvent<IMessage>("message.received", handleMessage, !!currentUserId)
}
