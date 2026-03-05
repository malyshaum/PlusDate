import { useEffect, useRef, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { debounce } from "lodash"
import type { BackButton } from "@tma.js/sdk"

const getBackButton = async () => {
  try {
    const sdk = await import("@tma.js/sdk-react")
    return sdk.backButton
  } catch {
    return null
  }
}

export function useTelegramBackButtonVisibility(hiddenOnPaths: string[]) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentlyVisible = useRef<boolean | null>(null)
  const [backButton, setBackButton] = useState<BackButton | null>(null)

  const debouncedNavigate = useMemo(
    () =>
      debounce(
        () => {
          void navigate(-1)
        },
        300,
        { leading: true, trailing: false },
      ),
    [navigate],
  )

  useEffect(() => {
    let mounted = true
    void getBackButton().then((b) => {
      if (mounted) setBackButton(b)
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!backButton?.show?.isAvailable?.()) return

    const shouldShow = !hiddenOnPaths.includes(location.pathname)

    if (currentlyVisible.current !== shouldShow) {
      if (shouldShow) {
        backButton?.show?.()
      } else {
        backButton?.hide?.()
      }
      currentlyVisible.current = shouldShow
    }

    if (shouldShow && !location.pathname.startsWith("/premium")) {
      let offClick: (() => void) | null = null
      if (backButton?.onClick?.isAvailable?.()) {
        offClick = backButton?.onClick(() => void debouncedNavigate())
      }

      return () => {
        offClick?.()
      }
    }
  }, [location.pathname, debouncedNavigate, hiddenOnPaths, backButton])

  useEffect(() => {
    return () => {
      debouncedNavigate.cancel()
    }
  }, [debouncedNavigate])

  return null
}

export function useTelegramBackButton(show: boolean, onBack: () => void) {
  const [backButton, setBackButton] = useState<BackButton | null>(null)

  useEffect(() => {
    let mounted = true
    void getBackButton().then((b) => {
      if (mounted) setBackButton(b)
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!backButton?.show?.isAvailable?.()) return
    if (!show) return

    backButton?.show?.()
    const offClick = backButton?.onClick ? backButton?.onClick(onBack) : null

    return () => {
      offClick?.()
      backButton?.hide?.()
    }
  }, [show, onBack, backButton])
}
