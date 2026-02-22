import { ESex, type RejectionReason } from "@/shared/types/common.ts"
import type { ICity, IHobby } from "@/entities/dictionary/model/types.ts"
import type { PaginatedResponse } from "@/shared/types/api"

export interface IUserDto {
  user_id?: number
  name?: string
  instagram?: string
  sex?: string
  age?: number
  city_id?: number
  search_for?: string
  profile_description?: string
  hobbies?: number[]
  photos?: File[]
  videos?: File[]
  verification_photo?: File
  height?: number
  eye_color?: string
  activity_ids?: number[]
  settings?: {
    hide_age?: boolean
  }
  language_code?: string
}

export interface IUser {
  id: number
  name: string
  username: string
  is_onboarded: boolean
  is_under_moderation: boolean
  start_param: string | null
  instagram: string
  profile_description?: string
  files: IUserFile[]
  language_code?: string
  is_premium: boolean
  limits: {
    likes: number
    dislikes: number
    superlikes: number
  }
  feed_profile: {
    id: number
    user_id: number
    city: ICity
    sex: ESex
    search_for: IUserSearchFor
    eye_color?: string
    height?: string
    coordinates: {
      type: string
      coordinates: number[]
    }
    created_at: string
    updated_at: string
    vector?: string
    age: number
    activity?: {
      id: number
      title: string
    }
    activities:
      | {
          id: number
          title: string
        }[]
      | null
    hobbies?: IHobby[]
  }
  moderation?: Moderation[]
  settings: {
    hide_age?: boolean
  }
  search_preference: IUserPreferences
  blocked: boolean
  blocked_at: string | null
}

export type IUserPreferencesDto = Partial<IUserPreferences>

export interface IUserPreferences {
  gender: ESex
  search_for: IUserSearchFor | null
  city_id: number
  city: ICity
  with_video: boolean
  with_premium: boolean
  from_age: number
  to_age: number
  height_from: number | null
  height_to: number | null
  activity_id?: number | null
  activity?: {
    id: number
    title: string
  }
  eye_color?: string[]
  hobbies?: number[]
  activities:
    | {
        id: number
        title: string
      }[]
    | null
  activity_ids?: number[]
}

export interface Moderation {
  id: number
  user_id: number
  rejection_reason: RejectionReason
  is_resolved: boolean
  note?: string
  file?: IUserFile
}

export interface IUserFile {
  id: number
  user_id: number
  type: "image" | "video" | "verification_photo"
  url: string
  filepath: string
  created_at: string
  updated_at: string
  file_id: number | null
  is_under_moderation: boolean
  is_main: boolean
  deleted_at: string | null
  moderation: Array<{
    id: number
    user_id: number
    rejection_reason: 6 | 7 | 8 | 10
    is_resolved: boolean
    created_at: string
    updated_at: string
    user_file_id: number
  }>
  thumbnail_url?: string
}

export type IUserSearchFor = "relations" | "friends" | "no_answer"

export interface UpdateUserPhotoDto {
  photos: Array<{
    file: File
    file_id: number
  }>
}

export interface UploadUserPhotoDto {
  file: File
  file_type: "image" | "verification_photo"
}

export interface UploadUserVideoDto {
  file: File
}

export interface UpdateUserFilesDto {
  files?: Array<{
    file: File
    file_id?: number
    file_type?: "image" | "video" | "verification_photo"
  }>
  name?: string
  profile_description?: string
  instagram?: string
}

export interface UpdateUserVideoDto {
  file: File
  file_id?: number
}

export interface IUserLimits {
  likes: number
  superlikes: number
  likes_day_limit: number
  superlikes_day_limit: number
  current_phase: string
  cooldown_ends_at: string
  is_on_cooldown: boolean
}

export interface IUserStats {
  unread_chats: number
  unresolved_likes: number
  matches: number
  unviewed_matches: number
}

export interface IUserMatch {
  user_id: number
  profile_id: number
  user_name: string
  is_premium: boolean
  age: number
  created_at: string
  url: string
  chat_id: number
  is_viewed: boolean
}

export type IUserMatchResponse = PaginatedResponse<IUserMatch>
