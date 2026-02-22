import type { IUser } from "@/entities/user/model/types.ts"
import { useMemo } from "react"

const useProfileFullness = (user?: IUser) => {
  return useMemo(() => {
    if (!user) return false

    const { feed_profile } = user

    const hasRequiredFields = !!(
      feed_profile?.city &&
      feed_profile?.sex &&
      feed_profile?.search_for &&
      feed_profile?.age
    )

    const hasOptionalFields = !!(
      feed_profile?.eye_color &&
      feed_profile?.height &&
      feed_profile?.activities &&
      feed_profile.activities.length > 0 &&
      feed_profile?.hobbies &&
      feed_profile.hobbies.length > 0
    )

    return hasRequiredFields && hasOptionalFields
  }, [user])
}

export default useProfileFullness
