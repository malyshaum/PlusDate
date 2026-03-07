import type { Centrifuge } from "centrifuge"
import { createContext } from "react"

type EventCallback = (data: unknown) => void

export interface CentrifugeContextValue {
  isConnected: boolean
  subscribe: (event: string, callback: EventCallback) => () => void
  getClient: () => Centrifuge | null
}

export const CentrifugeContext = createContext<CentrifugeContextValue | null>(null)
