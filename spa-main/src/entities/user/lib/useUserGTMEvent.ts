import { useGTMEvent, type GTMPayload } from "@/shared/lib/useGTMEvent.ts"
import { useUser } from "@/entities/user/api/queries.ts"

export const useUserGTMEvent = () => {
  const sendGTMEvent = useGTMEvent()
  const { data: user } = useUser()

  return (payload: GTMPayload) => {
    sendGTMEvent({
      ...(user?.start_param ? { campaign_id: user?.start_param } : {}),
      ...(user?.id ? { user_id: user?.id } : {}),
      ...payload,
    })
  }
}
