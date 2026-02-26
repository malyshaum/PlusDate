import { create } from "zustand"
import { persist } from "zustand/middleware"

import type {
  TBasicInfo,
  TInterests,
  TMediaInfo,
  TVerificationInfo,
  TCityInfo,
  TAgeInfo,
} from "../model/schemas"

type OnboardingState = {
  infoChecked: boolean
  step: number
  basicInfo: TBasicInfo
  ageInfo: TAgeInfo
  cityInfo: TCityInfo
  interestsInfo: TInterests
  mediaInfo: TMediaInfo
  verificationInfo: TVerificationInfo
  isKeyboardOpen: boolean

  setInfoChecked: (checked: boolean) => void
  setStep: (step: number) => void
  setBasicInfo: (data: TBasicInfo) => void
  setAgeInfo: (data: TAgeInfo) => void
  setCityInfo: (data: TCityInfo) => void
  setInterestsInfo: (data: TInterests) => void
  setMediaInfo: (data: TMediaInfo) => void
  setVerificationInfo: (data: TVerificationInfo) => void
  setIsKeyboardOpen: (isOpen: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      infoChecked: true,
      step: 1,
      basicInfo: {
        name: "",
        instagram: "",
        sex: "",
      },
      ageInfo: {
        age: "24",
      },
      cityInfo: {
        city_id: 0,
        en_country_name: "",
        en_name: "",
        ru_country_name: "",
        ru_name: "",
      },
      interestsInfo: {
        search_for: "relations",
        profile_description: "",
        hobbies: [],
      },
      activityInfo: {
        activity: 1,
      },
      heightInfo: {
        height: "172",
      },
      eyeInfo: {
        eye_color: "blue",
      },
      mediaInfo: {
        photo1: undefined,
        photo2: undefined,
        photo3: undefined,
        video: undefined,
      },
      verificationInfo: {
        verification_photo: new File([], ""),
      },
      isKeyboardOpen: false,
      setStep: (data: number) => set({ step: data }),
      setBasicInfo: (data) => set({ basicInfo: data }),
      setAgeInfo: (data) => set({ ageInfo: data }),
      setCityInfo: (data) => set({ cityInfo: data }),
      setInterestsInfo: (data) => set({ interestsInfo: data }),
      setMediaInfo: (data) => set({ mediaInfo: data }),
      setVerificationInfo: (data) => set({ verificationInfo: data }),
      setIsKeyboardOpen: (isOpen: boolean) => set({ isKeyboardOpen: isOpen }),
      setInfoChecked: (data) => set({ infoChecked: data }),
    }),
    {
      name: "onboarding-store1",
      partialize: (state) => ({
        basicInfo: state.basicInfo,
        ageInfo: state.ageInfo,
        cityInfo: state.cityInfo,
        interestsInfo: state.interestsInfo,
      }),
    },
  ),
)
