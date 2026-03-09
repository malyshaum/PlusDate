import { createContext, useContext } from "react"

export const PresenceOverrideContext = createContext<Map<number, boolean> | null>(null)

export const usePresenceOverride = (userId: number | undefined): boolean | undefined => {
  const map = useContext(PresenceOverrideContext)
  if (!map || !userId || !map.has(userId)) return undefined
  return map.get(userId)
}
