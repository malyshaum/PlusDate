import { useMemo } from "react"
import type { IUser } from "../model/types"

export const useAppliedFiltersCount = (user: IUser | undefined): number => {
  return useMemo(() => {
    if (!user?.search_preference || !user?.feed_profile) return 0

    let count = 0
    const preferences = user.search_preference
    const profile = user.feed_profile

    if (preferences.gender === profile.sex) {
      count++
    }

    if (preferences.search_for && preferences.search_for !== profile.search_for) {
      count++
    }

    if (preferences.city_id !== profile.city.id) {
      count++
    }

    if (preferences.with_video) {
      count++
    }

    if (preferences.with_premium) {
      count++
    }

    if (preferences.from_age !== 18 || preferences.to_age !== 60) {
      count++
    }

    if (
      (preferences.height_from !== null && preferences.height_from !== 100) ||
      (preferences.height_to !== null && preferences.height_to !== 220)
    ) {
      count++
    }

    if (preferences.activity_id) {
      count++
    }

    if (preferences.eye_color && preferences.eye_color.length > 0) {
      count++
    }

    if (preferences.hobbies && preferences.hobbies.length > 0) {
      count++
    }

    return count
  }, [user])
}
