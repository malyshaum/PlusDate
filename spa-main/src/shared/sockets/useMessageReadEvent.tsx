import { useCallback } from "react"
import { useCentrifugeEvent } from "./useCentrifugeEvent"

interface MessageReadEvent {
  message_id: number
  chat_id: number
}

export const useMessageReadEvent = (
  currentUserId?: number,
  callback?: (data: MessageReadEvent) => void,
) => {
  const handleMessageRead = useCallback(
    (data: MessageReadEvent) => {
      if (!currentUserId || !callback) return
      callback(data)
    },
    [currentUserId, callback],
  )

  useCentrifugeEvent<MessageReadEvent>("message.read", handleMessageRead, !!currentUserId)
}
