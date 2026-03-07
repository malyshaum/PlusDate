import { useContext } from "react"
import { CentrifugeContext, type CentrifugeContextValue } from "./centrifugeContextValue"

export const useCentrifugeContext = (): CentrifugeContextValue => {
  const context = useContext(CentrifugeContext)
  if (!context) {
    throw new Error("useCentrifugeContext must be used within a CentrifugeProvider")
  }
  return context
}
