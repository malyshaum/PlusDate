import type { IUserPreferencesDto } from "@/entities/user/model/types.ts"
import { ESex } from "@/shared/types/common.ts"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export const useResetPreferences = () => {
  const { mutate } = useUserUpdatePreferences()
  const { triggerImpact } = useHapticFeedback()
  const { data: user } = useUser()

  const handleResetFilters = () => {
    triggerImpact()
    const payload: IUserPreferencesDto = {
      gender: user?.feed_profile?.sex === ESex.male ? ESex.female : ESex.male,
      city_id: user?.feed_profile?.city?.id,
      search_for: user?.feed_profile.search_for,
      with_video: false,
      with_premium: false,
      from_age: 18,
      to_age: 60,
      height_from: null,
      height_to: null,
      activity_id: null,
      eye_color: [],
      hobbies: [],
    }
    mutate(payload)
  }

  return { handleResetFilters }
}
