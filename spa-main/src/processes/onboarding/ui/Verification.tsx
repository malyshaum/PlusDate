import { type WithTranslation, withTranslation } from "react-i18next"
import { type SubmitHandler } from "react-hook-form"

import { BottomButton, BottomButtonGroup } from "@/shared/ui"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"
import { type TVerificationInfo } from "../model/schemas.ts"
import VerificationExample from "@/shared/assets/images/verification_example.webp"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { CameraModal } from "@/widgets"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useOnboard, useUploadPhoto, useUser } from "@/entities/user/api/queries.ts"
import type { IUserDto } from "@/entities/user/model/types.ts"
import i18n from "i18next"
import { useNavigate } from "react-router-dom"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { useSelfieVerification } from "@/processes/onboarding/lib/useSelfieVerification.ts"
import classNames from "classnames"

const VerificationBase = ({ t }: WithTranslation) => {
  const { verificationInfo, basicInfo, ageInfo, cityInfo, interestsInfo, setVerificationInfo } =
    useOnboardingStore()
  const { triggerImpact } = useHapticFeedback()
  useStep(6)
  const { data: user } = useUser()
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()
  const uploadPhotoMutation = useUploadPhoto()
  const {
    isCameraOpen,
    videoConstraints,
    capturedImage,
    fileInputRef,
    hasValidPhoto,
    verificationPhoto,
    isPhone,
    handleStartCamera,
    handleCloseCamera,
    handleDeviceCameraCapture,
    handleWebCameraCapture,
    handleRetakePhoto,
    handleSubmit,
  } = useSelfieVerification(verificationInfo)

  const { mutate, isPending } = useOnboard({
    onSuccess: () => {
      localStorage.removeItem("onboarding-store1")
      sendUserEvent({ event: "onboarding_finished" })
      void navigate("/moderation-splash?fromOnboarding=1")
    },
  })

  const onSubmit: SubmitHandler<TVerificationInfo> = async (data) => {
    setVerificationInfo(data)
    const payload: IUserDto = {
      user_id: user?.id,
      name: basicInfo.name,
      instagram: basicInfo.instagram,
      sex: basicInfo.sex,
      age: Number(ageInfo.age),
      city_id: cityInfo.city_id,
      search_for: interestsInfo.search_for,
      profile_description: interestsInfo.profile_description,
      hobbies: interestsInfo.hobbies.map((i) => Number(i)),
      language_code: i18n.resolvedLanguage,
    }
    await uploadPhotoMutation.mutateAsync({
      file: data.verification_photo,
      file_type: "verification_photo",
    })
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => ![null, undefined, ""].includes(value as string | null | undefined),
      ),
    )
    sendUserEvent({ event: "verification_photo_selected" })
    triggerImpact("medium")
    mutate(filteredPayload)
  }

  return (
    <div className='flex flex-col h-full pb-safe-area-bottom-with-button'>
      <h1 className='title1-bold mb-2 px-4'>{t("onboarding.verification.title")}</h1>
      <p className='opacity-50 caption1-medium px-4 max-w-[90%]'>
        {t("onboarding.verification.description")}
      </p>

      <form
        className='flex flex-col h-full overflow-hidden'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className='flex flex-col h-full items-center justify-center gap-3 px-4'>
          <div className='flex items-center justify-center gap-2'>
            <div
              className={classNames(
                "flex-1 rounded-[8px] overflow-hidden",
                hasValidPhoto ? "h-[250px]" : "h-[340px]",
              )}
            >
              <img
                src={VerificationExample}
                alt='example'
                loading='eager'
                className='w-full h-full object-cover'
              />
            </div>

            {hasValidPhoto && (
              <div className='flex-1 rounded-[8px] overflow-hidden h-[250px]'>
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt='Verification photo'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(verificationPhoto)}
                    alt='Verification photo'
                    className='w-full h-full object-cover'
                  />
                )}
              </div>
            )}
          </div>
          {hasValidPhoto ? (
            <p className='text-center opacity-50 caption1-medium'>
              {t("onboarding.verification.checkPhoto")}
            </p>
          ) : (
            <p className='text-center opacity-50 caption1-medium max-w-[254px]'>
              {t("onboarding.verification.note")}
            </p>
          )}
        </div>

        {!hasValidPhoto ? (
          <BottomButton onClick={handleStartCamera}>
            <span className='button-main'>{t("onboarding.verification.makePhoto")}</span>
          </BottomButton>
        ) : (
          <BottomButtonGroup
            secondaryButton={{
              onClick: handleRetakePhoto,
              children: (
                <span className='button-main'>{t("onboarding.verification.remakePhoto")}</span>
              ),
              disabled: isPending || uploadPhotoMutation.isPending,
            }}
            primaryButton={{
              type: "submit",
              disabled: isPending || uploadPhotoMutation.isPending,
              isLoading: isPending || uploadPhotoMutation.isPending,
              children: <span className='button-main'>{t("continue")}</span>,
            }}
            className='absolute bottom-0 left-0 right-0'
          />
        )}
      </form>

      {isPhone ? (
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          capture='user'
          className='hidden'
          onChange={handleDeviceCameraCapture}
        />
      ) : (
        <CameraModal
          isOpen={isCameraOpen}
          onClose={handleCloseCamera}
          onCapture={handleWebCameraCapture}
          videoConstraints={videoConstraints}
        />
      )}
    </div>
  )
}

export const Verification = withTranslation()(VerificationBase)
