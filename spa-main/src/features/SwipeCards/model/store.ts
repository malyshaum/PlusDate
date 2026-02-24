import { create } from "zustand"
import type { SwipeFeedState } from "./types"

interface SwipeFeedActions {
  setCanRevert: (canRevert: boolean, swipeId?: number | null) => void
  clearRevertState: () => void
  setCurrentIndex: (index: number) => void
  resetFeedState: () => void
  setIsResettingFilters: (value: boolean) => void
  setCardPressed: (cardId: number | null) => void
  setIsAnimating: (value: boolean) => void
  setIsDragging: (value: boolean) => void
  setPendingDislike: (profileId: number | null) => void
  setVideoMuted: (value: boolean) => void
}

type SwipeFeedStore = SwipeFeedState & SwipeFeedActions

const initialState: SwipeFeedState = {
  canRevert: false,
  lastDislikeSwipeId: null,
  currentIndex: 0,
  isResettingFilters: false,
  pressedCardId: null,
  isAnimating: false,
  isDragging: false,
  pendingDislike: null,
  isVideoMuted: true,
}

export const useSwipeFeedStore = create<SwipeFeedStore>()((set) => ({
  ...initialState,

  setCanRevert: (canRevert: boolean, swipeId?: number | null) => {
    set({
      canRevert,
      lastDislikeSwipeId: canRevert ? swipeId || null : null,
    })
  },

  clearRevertState: () => {
    set({
      canRevert: false,
      lastDislikeSwipeId: null,
    })
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index })
  },

  resetFeedState: () => {
    set(initialState)
  },

  setIsResettingFilters: (value: boolean) => {
    set({ isResettingFilters: value })
  },

  setCardPressed: (cardId: number | null) => {
    set({ pressedCardId: cardId })
  },

  setIsAnimating: (value: boolean) => {
    set({ isAnimating: value })
  },

  setIsDragging: (value: boolean) => {
    set({ isDragging: value })
  },

  setPendingDislike: (profileId: number | null) => {
    set({ pendingDislike: profileId })
  },

  setVideoMuted: (value: boolean) => {
    set({ isVideoMuted: value })
  },
}))
