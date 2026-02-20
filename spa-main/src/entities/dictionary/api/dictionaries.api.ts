import api from "@/shared/api/instance.api.ts"
import { objectToQueryString, type QueryParams } from "@/shared/api/helper.ts"
import type { IActivity, ICity, IHobby } from "@/entities/dictionary/model/types.ts"

export const getCities = (payload: QueryParams): Promise<ICity[]> => {
  return api.get(`/dictionary/cities?${objectToQueryString(payload)}`)
}

export const getHobbies = (payload: QueryParams): Promise<IHobby[]> => {
  return api.get(`/dictionary/hobbies?${objectToQueryString(payload)}`)
}

export const getActivities = (payload: QueryParams): Promise<IActivity[]> => {
  return api.get(`/dictionary/activities?${objectToQueryString(payload)}`)
}
