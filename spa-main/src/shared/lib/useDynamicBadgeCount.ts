import { useLayoutEffect, useState, useRef } from "react"

export const useDynamicBadgeCount = (badgesLength: number, isExpanded: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxVisibleBadges, setMaxVisibleBadges] = useState(3)

  useLayoutEffect(() => {
    if (!containerRef.current || isExpanded || badgesLength <= 3) {
      setMaxVisibleBadges((prev) => (prev === 3 ? prev : 3))
      return
    }

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const labels = container.querySelectorAll("[data-label]")

    if (labels.length === 0) return

    let totalWidth = 0
    const gap = 4

    for (let i = 0; i < Math.min(3, labels.length); i++) {
      totalWidth += (labels[i] as HTMLElement).offsetWidth + gap
    }

    const plusLabelWidth = 50
    totalWidth += plusLabelWidth

    const newMax = totalWidth > containerWidth ? 2 : 3
    setMaxVisibleBadges((prev) => (prev === newMax ? prev : newMax))
  }, [badgesLength, isExpanded])

  return { containerRef, maxVisibleBadges }
}
