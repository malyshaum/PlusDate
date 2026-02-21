import type { ILike } from "../model/types"
import type { PaginatedResponse } from "@/shared/types/api"
import api from "@/shared/api/instance.api.ts"
import type { SwipeAction } from "@/features/SwipeCards"
import type { Match } from "@/features/SwipeCards/model/types.ts"

export const fetchLikes = async (
  cursor?: string,
  only_mutual?: boolean,
): Promise<PaginatedResponse<ILike>> => {
  return api.get("/user/likes", { params: { cursor: cursor, only_mutual: only_mutual } })
}

export const respondToLike = async (profileId: number, action: SwipeAction): Promise<Match> => {
  return api.post("/likes/respond", {
    profile_id: profileId,
    action: action,
  })
}
