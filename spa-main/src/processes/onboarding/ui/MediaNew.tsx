import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { BottomButton } from "@/shared/ui"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import {
  useUser,
  useUploadPhoto,
  useDeleteFile,
  useDeleteUserVideo,
  useUploadVideo,
  USER_KEYS,
} from "@/entities/user/api/queries.ts"
import type { SlotState } from "@/processes/onboarding/model/schemas.ts"
import { MediaPhotos } from "./MediaPhotos.tsx"
import { MediaVideo } from "./MediaVideo.tsx"

const EMPTY_SLOT: SlotState = { type: "empty" }

const MediaNewBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()

  useStep(5)

  const { data: user } = useUser()
  const uploadPhotoMutation = useUploadPhoto()
  const deleteFileMutation = useDeleteFile()
  const uploadVideoMutation = useUploadVideo()
  const deleteVideoMutation = useDeleteUserVideo()

  const [localSlots, setLocalSlots] = useState<[SlotState, SlotState, SlotState]>([
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
  ])

  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current || !user) return
    initializedRef.current = true

    const photos = user.files.filter((f) => f.type === "image" && !f.deleted_at)
    setLocalSlots([
      photos[0] ? { type: "server", file: photos[0] } : EMPTY_SLOT,
      photos[1] ? { type: "server", file: photos[1] } : EMPTY_SLOT,
      photos[2] ? { type: "server", file: photos[2] } : EMPTY_SLOT,
    ])
  }, [user])

  const objectUrlsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const userVideo = user?.files.find((f) => f.type === "video" && !f.deleted_at)

  const handlePhotoUpload = useCallback(
    (file: File, slotIndex: number) => {
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.add(objectUrl)

      setLocalSlots((prev) => {
        const next = [...prev] as [SlotState, SlotState, SlotState]
        next[slotIndex] = {
          type: "local",
          objectUrl,
          status: "uploading",
          fileName: file.name,
          fileSize: file.size,
          fileLastModified: file.lastModified,
        }
        return next
      })

      uploadPhotoMutation
        .mutateAsync({ file, file_type: "image" })
        .then(() => {
          setLocalSlots((prev) => {
            const next = [...prev] as [SlotState, SlotState, SlotState]
            const slot = next[slotIndex]
            if (slot.type === "local" && slot.objectUrl === objectUrl) {
              next[slotIndex] = { ...slot, status: "success" }
            }
            return next
          })
        })
        .catch(() => {
          setLocalSlots((prev) => {
            const next = [...prev] as [SlotState, SlotState, SlotState]
            const slot = next[slotIndex]
            if (slot.type === "local" && slot.objectUrl === objectUrl) {
              next[slotIndex] = { ...slot, status: "error" }
            }
            return next
          })
        })

      sendUserEvent({ event: "files_selected" })
    },
    [uploadPhotoMutation, sendUserEvent],
  )

  const handlePhotoDelete = useCallback(
    async (slotIndex: number) => {
      triggerImpact()
      const slot = localSlots[slotIndex]

      if (slot.type === "server") {
        await deleteFileMutation.mutateAsync(slot.file.id)
      }

      if (slot.type === "local") {
        URL.revokeObjectURL(slot.objectUrl)
        objectUrlsRef.current.delete(slot.objectUrl)
      }

      setLocalSlots((prev) => {
        const next = [...prev] as [SlotState, SlotState, SlotState]
        next[slotIndex] = EMPTY_SLOT
        return next
      })
    },
    [localSlots, deleteFileMutation, triggerImpact],
  )

  const attachedPhotosCount = localSlots.filter(
    (s) => s.type === "server" || (s.type === "local" && s.status === "success"),
  ).length

  const hasAnyUploading = localSlots.some((s) => s.type === "local" && s.status === "uploading")
  const hasUploadError = localSlots.some((s) => s.type === "local" && s.status === "error")

  const [photoValidationError, setPhotoValidationError] = useState<string | null>(null)
  const [videoValidationError, setVideoValidationError] = useState<string | null>(null)

  const photoError = photoValidationError
    ? t(photoValidationError)
    : hasUploadError
      ? t("validation.upload_failed")
      : null

  const videoError = videoValidationError ? t(videoValidationError) : null

  const handleVideoUpload = async (file: File) => {
    triggerImpact()
    await uploadVideoMutation.mutateAsync({ file })
  }

  const handleVideoDelete = async (videoId: number) => {
    await deleteVideoMutation.mutateAsync(videoId)
  }

  const handleContinue = async () => {
    triggerImpact()
    await queryClient.invalidateQueries({
      queryKey: [USER_KEYS.user, USER_KEYS.me],
    })
    await navigate("/onboarding/verification")
  }

  return (
    <div className='flex flex-col h-full'>
      <h1 className='title1-bold px-4 mb-2'>{t("onboarding.media.title")}</h1>
      <p className='body-regular px-4 text-white-50'>{t("onboarding.media.note")}</p>
      <p className='body-regular px-4 text-white-50'>{t("onboarding.media.subNote")}</p>

      <div className='mt-4 flex flex-col h-full flex-1 overflow-hidden gap-2'>
        <div className='flex-1 h-full px-4 overflow-y-auto'>
          <div className='grid grid-cols-2 gap-2'>
            <MediaPhotos
              slots={localSlots}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              onValidationError={setPhotoValidationError}
              className='contents'
            />
            <MediaVideo
              video={userVideo}
              onUpload={handleVideoUpload}
              onDelete={handleVideoDelete}
              onValidationError={setVideoValidationError}
            />
          </div>
          {(photoError || videoError) && (
            <span className='text-accent caption1-medium text-xs mt-1'>
              {photoError || videoError}
            </span>
          )}
        </div>

        <BottomButton
          onClick={handleContinue}
          disabled={attachedPhotosCount !== 3 || hasAnyUploading || uploadVideoMutation.isPending}
        >
          <span className='button-main'>
            {t("photo")} {attachedPhotosCount} / 3
          </span>
        </BottomButton>
      </div>
    </div>
  )
}

export const MediaNew = withTranslation()(MediaNewBase)
