import { useEffect, useCallback } from "react"
import { hapticFeedback } from "@tma.js/sdk-react"

export type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft"
type NotificationType = "error" | "success" | "warning"

export const useHapticFeedback = (triggerOnMount?: boolean) => {
  const triggerImpact = useCallback((style: ImpactStyle = "light") => {
    if (hapticFeedback.impactOccurred.isAvailable()) {
      hapticFeedback.impactOccurred(style)
    }
  }, [])

  const triggerNotification = useCallback((type: NotificationType = "success") => {
    if (hapticFeedback.notificationOccurred.isAvailable()) {
      hapticFeedback.notificationOccurred(type)
    }
  }, [])

  const triggerSelectionChanged = useCallback(() => {
    if (hapticFeedback.selectionChanged.isAvailable()) {
      hapticFeedback.selectionChanged()
    }
  }, [])

  const isSupported = hapticFeedback.isSupported()

  useEffect(() => {
    if (triggerOnMount) {
      triggerImpact("light")
    }
  }, [triggerImpact, triggerOnMount])

  return {
    triggerImpact,
    triggerNotification,
    triggerSelectionChanged,
    isSupported,
  }
}
