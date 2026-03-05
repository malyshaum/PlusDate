import { useUser } from "@/entities/user/api/queries"
import { useSwipeFeedStore } from "@/features/SwipeCards"
import { throttle } from "lodash"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export enum AudioIconState {
  On = "on",
  Off = "off",
}

export const useVideoSoundToggle = () => {
  const { data: user } = useUser()
  const isVideoMuted = useSwipeFeedStore((state) => state.isVideoMuted)
  const setVideoMuted = useSwipeFeedStore((state) => state.setVideoMuted)
  const [showAudioIcon, setShowAudioIcon] = useState<AudioIconState | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    if (showAudioIcon) {
      animationTimeoutRef.current = setTimeout(() => {
        setShowAudioIcon(null)
      }, 1000)
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [showAudioIcon])

  const toggleAudio = useCallback(() => {
    setVideoMuted(!isVideoMuted)
    setShowAudioIcon(!isVideoMuted ? AudioIconState.Off : AudioIconState.On)
  }, [isVideoMuted, setVideoMuted])

  const toggleAudioThrottled = useMemo(() => throttle(toggleAudio, 400), [toggleAudio])

  return {
    isMuted: isVideoMuted,
    toggleAudioThrottled,
    showAudioIcon,
    accountUser: user,
    setShowAudioIcon,
    setIsMuted: setVideoMuted,
  }
}
