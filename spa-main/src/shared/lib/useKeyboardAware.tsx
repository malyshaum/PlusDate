import { useEffect, useRef } from "react"

export const useKeyboardAware = <T extends HTMLElement = HTMLDivElement>(
  targetTags: string[] = ["TEXTAREA"],
) => {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (targetTags.includes(target.tagName)) {
        if (target.classList.contains("sr-only") || target.offsetParent === null) {
          return
        }
        setTimeout(() => {
          let scrollContainer = target.closest(".overflow-y-auto, .overflow-auto") as HTMLElement
          if (!scrollContainer) {
            scrollContainer = document.documentElement
          }

          const containerRect = scrollContainer.getBoundingClientRect()
          const targetRect = target.getBoundingClientRect()

          const relativeTop = targetRect.top - containerRect.top
          const desiredPosition = 60
          const newScrollTop = scrollContainer.scrollTop + relativeTop - desiredPosition

          scrollContainer.scrollTo({
            top: newScrollTop,
            behavior: "smooth",
          })
        }, 300)
      }
    }

    const handleBlur = () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 100)
    }

    element.addEventListener("focusin", handleFocus)
    element.addEventListener("focusout", handleBlur)

    return () => {
      element.removeEventListener("focusin", handleFocus)
      element.removeEventListener("focusout", handleBlur)
    }
  }, [targetTags])

  return ref
}
