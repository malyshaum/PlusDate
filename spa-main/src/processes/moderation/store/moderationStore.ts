import { create } from "zustand"

import type { TMediaInfo, TVerificationInfo } from "../model/schemas"

type ModerationState = {
  mediaInfo: TMediaInfo
  verificationInfo: TVerificationInfo
  setMediaInfo: (data: TMediaInfo) => void
  setVerificationInfo: (data: TVerificationInfo) => void
}

export const useModerationStore = create<ModerationState>()((set) => ({
  mediaInfo: {
    photo1: undefined,
    photo2: undefined,
    photo3: undefined,
    video: undefined,
  },
  verificationInfo: {
    verification_photo: new File([], ""),
  },
  setMediaInfo: (data) => set({ mediaInfo: data }),
  setVerificationInfo: (data) => set({ verificationInfo: data }),
}))
