import { withTranslation, type WithTranslation } from "react-i18next"
import { useUser, useUpdateUserFiles } from "@/entities/user/api/queries.ts"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ModerationFormSchema, type TModerationForm } from "../model/schemas.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { backButton } from "@tma.js/sdk-react"
import { InputField, TextareaField, BottomButtonGroup } from "@/shared/ui"
import { BottomButton } from "@/shared/ui"
import { ModerationImageCard } from "./ModerationImageCard.tsx"
import { ModerationVideoCard } from "./ModerationVideoCard.tsx"
import IconInstagram from "@/shared/assets/icons/icon-instagram.svg"
import { useNavigate } from "react-router-dom"
import { CameraModal, PageLayout } from "@/widgets"
import { base64ToImageFile } from "@/shared/lib/utils.ts"
import { PhotoPreview } from "@/shared/ui/FileInput/FilePhotoPreview.tsx"
import { UserModerationReasons } from "@/shared/const/constants.ts"
import type { UpdateUserFilesDto } from "@/entities/user/model/types.ts"
import { motion, AnimatePresence } from "framer-motion"

type Step = "fields" | "verification"

export const ModerationBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const { data: user } = useUser()
  const { mutate: updateFiles, isPending } = useUpdateUserFiles()
  const navigate = useNavigate()
  const [replacedFiles, setReplacedFiles] = useState<Record<number, File>>({})
  const [replacedVerificationPhoto, setReplacedVerificationPhoto] = useState<File | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isVideoDeleted, setIsVideoDeleted] = useState(false)

  const moderationReasons = user?.moderation?.filter((m) => !m.is_resolved) || []
  const hasNameIssue = moderationReasons.some((m) => Number(m.rejection_reason) === 14)
  const hasDescriptionIssue = moderationReasons.some((m) => Number(m.rejection_reason) === 15)
  const hasInstagramIssue = moderationReasons.some((m) => Number(m.rejection_reason) === 16)
  const hasVerificationPhotoIssue = moderationReasons.some(
    (m) => m?.file?.type === "verification_photo",
  )
  const hasImageIssue = moderationReasons.some(
    (m) => [1, 2, 3, 4].includes(Number(m.rejection_reason)) && m?.file?.type === "image",
  )
  const hasVideoIssue = moderationReasons.some((m) => m?.file?.type === "video")

  const onlyVerificationIssue =
    hasVerificationPhotoIssue &&
    !hasImageIssue &&
    !hasVideoIssue &&
    !hasNameIssue &&
    !hasDescriptionIssue &&
    !hasInstagramIssue

  const [step, setStep] = useState<Step>(onlyVerificationIssue ? "verification" : "fields")

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<TModerationForm>({
    resolver: zodResolver(ModerationFormSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      profile_description: user?.profile_description || "",
      instagram: user?.instagram || "",
    },
  })

  const imageFiles = useMemo(
    () => user?.files?.filter((f) => f.type === "image") || [],
    [user?.files],
  )
  const videoFiles = useMemo(
    () => user?.files?.filter((f) => f.type === "video") || [],
    [user?.files],
  )
  const verificationFile = user?.files?.find((f) => f.type === "verification_photo")

  const handleBackClick = useCallback(() => {
    triggerImpact()
    setStep("fields")
  }, [triggerImpact])

  const showBackButton = step === "verification" && !onlyVerificationIssue

  useEffect(() => {
    if (!backButton.show.isSupported()) return

    if (showBackButton) {
      const timer = setTimeout(() => {
        backButton.show()
      }, 0)

      const offClick = backButton.onClick(handleBackClick)

      return () => {
        clearTimeout(timer)
        offClick()
        backButton.hide()
      }
    } else {
      backButton.hide()
    }
  }, [showBackButton, handleBackClick])

  const handleTakePhoto = useCallback(() => {
    triggerImpact("medium")
    setIsCameraOpen(true)
  }, [triggerImpact])

  const handleCloseCamera = useCallback(() => {
    setIsCameraOpen(false)
  }, [])

  const handleCameraCapture = useCallback((imageBase64: string) => {
    const capturedFile = base64ToImageFile(imageBase64, "verification_photo.jpg")
    setReplacedVerificationPhoto(capturedFile)
    setIsCameraOpen(false)
  }, [])

  const handleReplaceFile = (fileId: number, file: File) => {
    setReplacedFiles((prev) => ({
      ...prev,
      [fileId]: file,
    }))
  }

  const handleVideoDeleted = (fileId: number) => {
    setIsVideoDeleted(true)
    setReplacedFiles((prev) => {
      const updated = { ...prev }
      delete updated[fileId]
      return updated
    })
  }

  const watchedName = watch("name")
  const watchedDescription = watch("profile_description")
  const watchedInstagram = watch("instagram")

  const isFormValid = useMemo(() => {
    const hasSchemaErrors = Object.keys(errors).length > 0
    if (hasSchemaErrors) return false

    const normalizeName = (val?: string) => val?.trim() || ""
    const normalizeOptional = (val?: string) => (val?.trim() === "" ? null : val?.trim())

    const nameChanged = normalizeName(watchedName) !== normalizeName(user?.name)
    const descriptionChanged =
      normalizeOptional(watchedDescription) !== normalizeOptional(user?.profile_description)
    const instagramChanged =
      normalizeOptional(watchedInstagram) !== normalizeOptional(user?.instagram)

    if (hasNameIssue && !nameChanged) return false
    if (hasDescriptionIssue && !descriptionChanged) return false
    if (hasInstagramIssue && !instagramChanged) return false

    if (hasImageIssue) {
      const imageFilesWithIssues = imageFiles.filter((file) =>
        user?.moderation?.map((m) => m?.file?.id)?.includes(file.id),
      )
      const allIssueFilesReplaced = imageFilesWithIssues.every((file) => replacedFiles[file.id])
      if (!allIssueFilesReplaced) return false
    }

    if (hasVideoIssue) {
      if (!isVideoDeleted) {
        const videoFilesWithIssues = videoFiles.filter((file) =>
          user?.moderation?.map((m) => m?.file?.id)?.includes(file.id),
        )
        const allIssueFilesReplaced = videoFilesWithIssues.every((file) => replacedFiles[file.id])
        if (!allIssueFilesReplaced) return false
      }
    }

    if (step === "verification" && hasVerificationPhotoIssue && !replacedVerificationPhoto) {
      return false
    }

    return (
      Object.keys(replacedFiles).length > 0 ||
      replacedVerificationPhoto !== null ||
      isVideoDeleted ||
      nameChanged ||
      descriptionChanged ||
      instagramChanged
    )
  }, [
    errors,
    replacedFiles,
    replacedVerificationPhoto,
    isVideoDeleted,
    watchedName,
    watchedDescription,
    watchedInstagram,
    user,
    hasNameIssue,
    hasDescriptionIssue,
    hasInstagramIssue,
    hasImageIssue,
    hasVideoIssue,
    hasVerificationPhotoIssue,
    imageFiles,
    videoFiles,
    step,
  ])

  const onSubmit = () => {
    const normalizeName = (val?: string) => val?.trim() || ""
    const normalizeOptional = (val?: string) => (val?.trim() === "" ? undefined : val?.trim())

    const payload: UpdateUserFilesDto = {}

    if (hasNameIssue && normalizeName(watchedName) !== normalizeName(user?.name)) {
      payload.name = normalizeName(watchedName)
    }

    if (
      hasDescriptionIssue &&
      normalizeOptional(watchedDescription) !== normalizeOptional(user?.profile_description)
    ) {
      payload.profile_description = normalizeOptional(watchedDescription)
    }

    if (
      hasInstagramIssue &&
      normalizeOptional(watchedInstagram) !== normalizeOptional(user?.instagram)
    ) {
      payload.instagram = normalizeOptional(watchedInstagram)
    }

    const files: UpdateUserFilesDto["files"] = []

    Object.entries(replacedFiles).forEach(([fileId, file]) => {
      const originalFile = [...imageFiles, ...videoFiles].find((f) => f.id === Number(fileId))
      const fileType = originalFile?.type === "video" ? "video" : "image"

      files.push({
        file,
        file_id: Number(fileId),
        file_type: fileType,
      })
    })

    if (replacedVerificationPhoto) {
      files.push({
        file: replacedVerificationPhoto,
        file_type: "verification_photo",
      })
    }

    if (files.length > 0) {
      payload.files = files
    }

    const navigateToSplash = () => {
      void navigate("/moderation-splash", { replace: true })
    }

    if (Object.keys(payload).length > 0) {
      updateFiles(payload, { onSuccess: navigateToSplash })
    } else {
      navigateToSplash()
    }
  }

  const videoConstraints = {
    facingMode: "user",
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  if (step === "verification") {
    return (
      <PageLayout className=''>
        <AnimatePresence mode='wait'>
          <motion.div
            key='verification'
            initial='initial'
            animate='animate'
            exit='exit'
            variants={pageVariants}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <h1 className='title1-bold mb-2'>{t("moderation.title")}</h1>
            <p className='caption1-medium opacity-50'>{t("moderation.verification.description")}</p>

            <div className='relative w-[240px] h-[340px] rounded-lg overflow-hidden border border-white-10 mx-auto mb-3 mt-12'>
              {replacedVerificationPhoto ? (
                <PhotoPreview
                  file={replacedVerificationPhoto}
                  alt='Verification photo'
                  className='w-full h-full object-cover'
                />
              ) : verificationFile ? (
                <img
                  src={verificationFile.url}
                  alt='Verification photo'
                  className='w-full h-full object-cover'
                />
              ) : null}
            </div>

            <div className='caption1-medium text-white-50 text-center w-[250px] mx-auto'>
              {t("moderation.verification.photoGuide")}
            </div>

            <BottomButtonGroup
              secondaryButton={{
                onClick: handleTakePhoto,
                disabled: isPending,
                children: (
                  <span className='button-main'>{t("onboarding.verification.remakePhoto")}</span>
                ),
              }}
              primaryButton={{
                onClick: onSubmit,
                disabled: !isFormValid || isPending,
                isLoading: isPending,
                children: <span className='button-main'>{t("send")}</span>,
              }}
              className='absolute bottom-0 left-0 right-0 z-20'
            />
          </motion.div>
        </AnimatePresence>

        <CameraModal
          isOpen={isCameraOpen}
          onClose={handleCloseCamera}
          onCapture={handleCameraCapture}
          videoConstraints={videoConstraints}
        />
      </PageLayout>
    )
  }

  const nameError = errors?.name
    ? errors?.name
    : watchedName === user?.name
      ? { type: "Custom", message: t(UserModerationReasons["14"]) }
      : undefined

  const descriptionError = errors?.profile_description
    ? errors?.profile_description
    : watchedDescription === user?.profile_description
      ? { type: "Custom", message: t(UserModerationReasons["15"]) }
      : undefined

  const instagramError = errors?.instagram
    ? errors?.instagram
    : watchedInstagram === user?.instagram
      ? { type: "Custom", message: t(UserModerationReasons["16"]) }
      : undefined

  return (
    <PageLayout className='pb-safe-area-bottom-with-button'>
      <AnimatePresence mode='wait'>
        <motion.div
          key='fields'
          initial='initial'
          animate='animate'
          exit='exit'
          variants={pageVariants}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <form>
            <h1 className={`title1-bold mb-2`}>{t("moderation.title")}</h1>
            {(hasImageIssue || hasVideoIssue) && (
              <p className='body-regular text-white-50 mb-3'>{t("moderation.description")}</p>
            )}

            {(hasImageIssue || hasVideoIssue) &&
              (() => {
                const hasBothTypes = hasImageIssue && hasVideoIssue
                const onlyVideo = hasVideoIssue && !hasImageIssue

                return (
                  <div
                    className={`mb-4 ${
                      onlyVideo
                        ? "flex justify-center"
                        : hasBothTypes
                          ? "grid grid-cols-2 gap-2"
                          : "flex gap-2"
                    }`}
                  >
                    {hasImageIssue &&
                      imageFiles.map((file) => {
                        const hasIssue = !!user?.moderation
                          ?.map((m) => m?.file?.id)
                          ?.includes(file.id)
                        const isReplaced = !!replacedFiles[file.id]
                        return (
                          <ModerationImageCard
                            key={file.id}
                            file={file}
                            replacedFile={replacedFiles[file.id]}
                            onReplace={hasIssue ? handleReplaceFile : undefined}
                            hasModerationIssue={hasIssue && !isReplaced}
                            rejection_reason={
                              user?.moderation?.find((m) => m?.file?.id === file.id)
                                ?.rejection_reason
                            }
                          />
                        )
                      })}
                    {hasVideoIssue &&
                      !isVideoDeleted &&
                      videoFiles.map((file) => {
                        const hasIssue = !!user?.moderation
                          ?.map((m) => m?.file?.id)
                          ?.includes(file.id)
                        const isReplaced = !!replacedFiles[file.id]
                        return (
                          <div key={file.id} className={onlyVideo ? "w-[250px]" : ""}>
                            <ModerationVideoCard
                              file={file}
                              replacedFile={replacedFiles[file.id]}
                              onReplace={hasIssue ? handleReplaceFile : undefined}
                              onDeleted={handleVideoDeleted}
                              hasModerationIssue={hasIssue && !isReplaced}
                              rejection_reason={
                                user?.moderation?.find((m) => m?.file?.id === file.id)
                                  ?.rejection_reason
                              }
                            />
                          </div>
                        )
                      })}
                  </div>
                )
              })()}
            {hasNameIssue && (
              <InputField<TModerationForm>
                name='name'
                register={register}
                error={nameError}
                label={t("name")}
                placeholder={t("name")}
              />
            )}

            {hasDescriptionIssue && (
              <TextareaField<TModerationForm>
                name='profile_description'
                register={register}
                error={descriptionError}
                label={t("interests.descriptionLabel")}
                placeholder={t("interests.descriptionLabel")}
                className={hasNameIssue ? "mt-4" : ""}
              />
            )}

            {hasInstagramIssue && (
              <InputField<TModerationForm>
                name='instagram'
                register={register}
                error={instagramError}
                placeholder={t("onboarding.basic.instagramName")}
                className={`[&>*>input]:pl-[157px] ${hasNameIssue || hasDescriptionIssue ? "mt-4" : ""}`}
                childrenBefore={
                  <div className='flex gap-2 items-center'>
                    <img src={IconInstagram} alt='' height={24} width={24} />
                    <span className='body-regular'>instagram.com/</span>
                  </div>
                }
              />
            )}
          </form>

          <BottomButton
            type='submit'
            onClick={() => {
              if (hasVerificationPhotoIssue) {
                triggerImpact()
                setStep("verification")
              } else {
                void onSubmit()
              }
            }}
            isLoading={isPending}
            disabled={!isFormValid || isPending}
            className='pb-safe-area-bottom'
          >
            <span className='button-main'>
              {hasVerificationPhotoIssue ? t("continue") : t("send")}
            </span>
          </BottomButton>
        </motion.div>
      </AnimatePresence>
    </PageLayout>
  )
}

export const Moderation = withTranslation()(ModerationBase)
