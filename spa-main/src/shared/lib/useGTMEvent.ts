import { useGoogleTagManager } from "@tracktor/react-google-tag-manager"

export interface GTMPayload extends Record<string, unknown> {
  event: string
}

export const useGTMEvent = () => {
  const { sendEvent } = useGoogleTagManager()

  return (payload: GTMPayload) => {
    sendEvent(payload)
  }
}
