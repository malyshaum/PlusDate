import { useEffect, useCallback } from "react"
import { useCentrifugeContext } from "./useCentrifugeContext"

export const useCentrifugeEvent = <T,>(
  event: string,
  callback: (data: T) => void,
  enabled = true,
) => {
  const { subscribe } = useCentrifugeContext()

  const stableCallback = useCallback(
    (data: unknown) => {
      callback(data as T)
    },
    [callback],
  )

  useEffect(() => {
    if (!enabled) return
    return subscribe(event, stableCallback)
  }, [event, stableCallback, enabled, subscribe])
}
