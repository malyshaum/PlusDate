import type { IUser } from "@/entities/user/model/types"
import type { IChat } from "@/entities/chats"

export interface ILike {
  id: number
  user_id: number
  profile_id: number
  action: "like" | "superlike"
  created_at: string
  updated_at: string
  is_mutual: boolean
  chat: IChat
  user: IUser
}
