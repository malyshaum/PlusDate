import { useEffect } from "react"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"

export const useStep = (step: number) => {
  const { setStep } = useOnboardingStore()
  useEffect(() => {
    setStep(step)
  }, [step, setStep])
}
