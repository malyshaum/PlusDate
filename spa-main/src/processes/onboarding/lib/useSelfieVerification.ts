import {
  VerificationInfoSchema,
  type TVerificationInfo,
} from "@/processes/onboarding/model/schemas"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { base64ToImageFile } from "@/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { retrieveLaunchParams } from "@tma.js/sdk-react"
import { useCallback, useRef, useState, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"

export const useSelfieVerification = (verificationInfo: TVerificationInfo) => {
  const { triggerImpact } = useHapticFeedback()
  const launchParams = retrieveLaunchParams()
  const { tgWebAppPlatform } = launchParams
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const methods = useForm<TVerificationInfo>({
    resolver: zodResolver(VerificationInfoSchema),
    mode: "onTouched",
    defaultValues: verificationInfo,
  })
  const { handleSubmit, setValue, watch } = methods

  const isPhone = tgWebAppPlatform === "ios"
  const verificationPhoto = watch("verification_photo")
  const hasValidPhoto = verificationPhoto && verificationPhoto.size > 0
  const videoConstraints = {
    facingMode: "user",
  }

  const handleStartCamera = useCallback(() => {
    triggerImpact("medium")
    triggerImpact()
    triggerImpact()
    fileInputRef.current?.click()
    setIsCameraOpen(true)
  }, [triggerImpact])

  const handleCloseCamera = useCallback(() => {
    setIsCameraOpen(false)
  }, [])

  const handleRetakePhoto = useCallback(() => {
    triggerImpact("medium")
    setCapturedImage(null)
    fileInputRef.current?.click()
    methods.resetField("verification_photo")
    setIsCameraOpen(true)
  }, [methods, triggerImpact])

  const handleWebCameraCapture = useCallback(
    (imageBase64: string) => {
      setCapturedImage(imageBase64)
      const file = base64ToImageFile(imageBase64, "verification_photo.jpg")
      setValue("verification_photo", file)
    },
    [setValue],
  )

  const handleDeviceCameraCapture = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === "string") {
          handleWebCameraCapture(result)
        }
      }
      reader.readAsDataURL(file)
    },
    [handleWebCameraCapture],
  )

  return {
    isCameraOpen,
    verificationPhoto,
    videoConstraints,
    capturedImage,
    fileInputRef,
    hasValidPhoto,
    isPhone,
    handleStartCamera,
    handleCloseCamera,
    handleDeviceCameraCapture,
    handleWebCameraCapture,
    handleRetakePhoto,
    handleSubmit,
  }
}
