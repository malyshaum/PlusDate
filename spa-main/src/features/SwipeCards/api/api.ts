import type { Match, SwipeAction } from "../model/types"
import api from "@/shared/api/instance.api.ts"
import type { IUser } from "@/entities/user/model/types.ts"
import type { PaginatedResponse } from "@/shared/types/api.ts"

export const fetchFeedProfiles = async (cursor?: string): Promise<PaginatedResponse<IUser>> => {
  return api.get("/feed/profiles", { params: { cursor, per_page: 20 } })
}

export const swipeProfile = async (profileId: number, action: SwipeAction): Promise<Match> => {
  return api.post(`/feed/swipe`, {
    profile_id: profileId,
    action: action,
  })
}

export const revertDislike = async (swipeId: number): Promise<void> => {
  return api.post(`/feed/swipe/revert`, {
    swipe_id: swipeId,
  })
}

export const deleteMatch = async (profile_id: number): Promise<void> => {
  return api.delete(`/feed/match`, { data: { profile_id: profile_id } })
}

export const viewMatch = async (profile_id: number): Promise<void> => {
  return api.put(`/feed/match/view`, { profile_id: profile_id })
}
