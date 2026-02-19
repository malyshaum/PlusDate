import type { IUser } from "@/entities/user/model/types"
import type { PaginatedResponse } from "@/shared/types/api"

export interface IMessage {
  id: number
  chat_id: number
  sender_id: number
  message: string
  sent_at: string
  read_at: string | null
  created_at: string
  updated_at: string
  firstUnread?: boolean
}

export interface ISocketMessage {
  id: number
  sender_id: number
  chat_id: number
  photo_url: string
  message: string
  name: string
}

export interface IChat {
  id: number
  created_at: string
  updated_at: string
  unread_count: number
  users: IUser[]
  latest_message: IMessage | null
}

export interface IChatRecent {
  id: number
  last_message: string
  user_id: number
  user_name: string
  url: string
  is_viewed: boolean
}

export type IChatRecentResponse = PaginatedResponse<IChatRecent>
export type IChatResponse = PaginatedResponse<IChat>
export type IMessagesResponse = PaginatedResponse<IMessage>

export interface ISendMessageRequest {
  chat_id: number
  message: string
}

export interface IReadMessagesRequest {
  chat_id: number
  message_id: number
}
