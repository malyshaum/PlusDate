import { useCallback, useEffect, type RefObject } from "react"

export const PROFILE_EDIT_SCROLL_KEY = "profileEdit.scroll"
export const SEARCH_PREFERENCES_SCROLL_KEY = "search-preferences-scroll-position"
export const LIKES_SCROLL_KEY = "likes-scroll-position"
export const CHATS_SCROLL_KEY = "chats-scroll-position"
export const MATCHES_SCROLL_KEY = "matches-scroll-position"
export const RECENT_MATCHES_SCROLL_KEY = "recent-matches-scroll-position"

export const SCROLL_KEYS = [
  PROFILE_EDIT_SCROLL_KEY,
  SEARCH_PREFERENCES_SCROLL_KEY,
  LIKES_SCROLL_KEY,
  CHATS_SCROLL_KEY,
  MATCHES_SCROLL_KEY,
  RECENT_MATCHES_SCROLL_KEY,
]

export const useScrollPositionRestore = (
  SCROLL_KEY: string = "",
  keyboardAwareRef?: RefObject<HTMLDivElement | null>,
  isHorizontal = false,
) => {
  const saveScroll = useCallback(() => {
    const container = keyboardAwareRef?.current
    if (!container) return
    sessionStorage.setItem(SCROLL_KEY, String(container.scrollTop || 0))
  }, [keyboardAwareRef, SCROLL_KEY])

  const saveHorizontalScroll = useCallback(() => {
    const container = keyboardAwareRef?.current
    if (!container) return
    sessionStorage.setItem(SCROLL_KEY, String(container.scrollLeft || 0))
  }, [keyboardAwareRef, SCROLL_KEY])

  const clearScroll = useCallback(() => {
    sessionStorage.removeItem(SCROLL_KEY)
  }, [SCROLL_KEY])

  const clearAllScrolls = useCallback(() => {
    SCROLL_KEYS.forEach((key) => sessionStorage.removeItem(key))
  }, [])

  useEffect(() => {
    const container = keyboardAwareRef?.current
    const savedScroll = sessionStorage.getItem(SCROLL_KEY)
    if (savedScroll && container && !isHorizontal) container.scrollTop = +savedScroll
    if (savedScroll && container && isHorizontal) container.scrollLeft = +savedScroll

    return () => {
      if (isHorizontal) {
        saveHorizontalScroll()
      } else {
        saveScroll()
      }
    }
  }, [keyboardAwareRef, saveScroll, saveHorizontalScroll, SCROLL_KEY, isHorizontal])

  return { saveScroll, saveHorizontalScroll, clearScroll, clearAllScrolls }
}
