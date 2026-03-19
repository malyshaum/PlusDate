import type { IMessage } from "@/entities/chats/model/types"
import { formatDate } from "@/shared/lib/date"

interface MessagesByDate {
  [date: string]: IMessage[]
}

export const groupMessagesByDate = (messages: IMessage[]): MessagesByDate => {
  return messages.reduce((acc, message) => {
    const date = formatDate(message.sent_at, "MMMM DD")

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(message)
    return acc
  }, {} as MessagesByDate)
}
