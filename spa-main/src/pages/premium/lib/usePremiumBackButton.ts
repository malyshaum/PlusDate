import { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { backButton } from "@tma.js/sdk-react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import type { Step } from "@/pages/premium/lib/types"

export const usePremiumBackButton = (step: Step, onStepBack: () => void) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()

  const handleBackClick = useCallback(() => {
    triggerImpact()
    if (step === "payment") {
      onStepBack()
    } else {
      void navigate(-1)
    }
  }, [step, triggerImpact, navigate, onStepBack])

  useEffect(() => {
    if (!backButton.show.isSupported()) return

    backButton.show()

    const offClick = backButton.onClick(handleBackClick)

    return () => {
      offClick()
    }
  }, [handleBackClick])
}
