import api from "@/shared/api/instance.api.ts"
import { serialize } from "object-to-formdata"
import { cleanObject } from "@/shared/lib/utils.ts"
import type {
  IUser,
  IUserDto,
  IUserFile,
  IUserLimits,
  IUserMatchResponse,
  IUserPreferences,
  IUserPreferencesDto,
  IUserStats,
  UpdateUserFilesDto,
  UpdateUserPhotoDto,
  UpdateUserVideoDto,
  UploadUserPhotoDto,
  UploadUserVideoDto,
} from "@/entities/user/model/types.ts"

export const login = async (payload: {
  query: string
  restore?: boolean
}): Promise<{ token?: string; message?: string }> => {
  return api.post("/login", payload)
}

export const me = async (): Promise<IUser> => {
  return api.get("/me")
}

export const files = async (): Promise<IUserFile[]> => {
  return api.get("/user/files")
}

export const update = async (data: IUserDto): Promise<IUser> => {
  const formData = serialize(cleanObject(data, ["instagram", "profile_description"]), {
    allowEmptyArrays: true,
  })
  return api.post("/user/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const updatePreferences = async (data: IUserPreferencesDto): Promise<IUserPreferences> => {
  return api.put("/user/search/preferences", data)
}

export const getUserById = async (userId?: number): Promise<IUser> => {
  return api.get(`/user/${userId}`)
}

export const updateUserPhoto = async (payload: UpdateUserPhotoDto): Promise<IUser> => {
  const formData = serialize(payload)
  return api.post("/user/photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const updateUserFiles = async (payload: UpdateUserFilesDto): Promise<IUser> => {
  const formData = serialize(payload, { indices: true })
  return api.post("/user/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deleteUserVideo = async (videoId: number): Promise<void> => {
  return api.delete(`/user/files/video/${videoId}`)
}

export const replaceUserVideo = async (payload: UpdateUserVideoDto): Promise<void> => {
  const formData = serialize(payload)
  return api.post("/user/files/video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const setUserMainPhoto = async (photo_id: number): Promise<IUser> => {
  return api.post(`/user/photo/${photo_id}/main`)
}

export const getUserLimits = async (): Promise<IUserLimits> => {
  return api.get("/user/swipes")
}

export const getUserStats = async (): Promise<IUserStats> => {
  return api.get("/user/stats")
}

export const onboard = async (data: IUserDto): Promise<IUser> => {
  return api.post("/user/onboard", data)
}

export const uploadPhoto = async (payload: UploadUserPhotoDto): Promise<IUser> => {
  const formData = serialize(payload)
  return api.post("/storage/file/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const uploadVideo = async (payload: UploadUserVideoDto): Promise<IUser> => {
  const formData = serialize(payload)
  return api.post("/storage/file/video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deleteFile = async (id: number): Promise<void> => {
  return api.delete("/storage/file", { data: { id } })
}

export const deleteProfile = async (data: { reasons: string[]; note?: string }): Promise<void> => {
  return api.delete("/user/account", { data })
}

export const reportUser = async (data: {
  reported_user_id: number
  reason_code: string
  custom_text?: string | null
  source: "swipe_feed" | "like_profile" | "chat_profile" | "chat"
}): Promise<void> => {
  return api.post("/reports", data)
}

export const getCentrifugoToken = async (): Promise<{ token: string }> => {
  return api.get("/centrifugo/token")
}

export const fetchOnlineProfiles = async (): Promise<number[]> => {
  return api.get("/users/presence")
}

export const blockUser = async (user_id: number): Promise<void> => {
  return api.post("/user/block", { blocked_user_id: user_id })
}

export const getUserMatches = async (cursor?: string): Promise<IUserMatchResponse> => {
  return api.get("/user/matches", { params: { cursor } })
}
