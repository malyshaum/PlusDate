import type { IChat } from "@/entities/chats/model/types"
import type { Range } from "@/pages/premium/model/types"

export interface ChatCreatedEventData {
  chat: IChat
  timestamp: string
}

export interface MatchCreatedProfile {
  user_id: number
  profile_id: number
  user_name: string
  is_premium: boolean
  age: number
  created_at: string
  chat_id: number
  is_viewed: boolean
  last_active_at: string
}

export interface MatchCreatedEventData {
  chat_id: number
  user_id: number
  photo_url: string
  profile: MatchCreatedProfile
}

export interface PremiumGrantedEventData {
  user_id: number
  is_premium: boolean
  subscription_type: Range
  active_until: string | null
  timestamp: string
}

export interface PremiumFailedEventData {
  user_id: number
  payment_system: string
  failure_type: string
  subscription_type: Range
  error_message: string
  error_code: string
  timestamp: string
}

export interface SocketEvent<T> {
  event: string
  data: T
  channel: string
}
