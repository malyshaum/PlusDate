import type { IUserFile } from "@/entities/user/model/types.ts"
import { useRef, lazy, useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import IconPlay from "@/shared/assets/icons/icon-play.svg"
import IconPencil from "@/shared/assets/icons/icon-pencil.svg?react"
import IconClose from "@/shared/assets/icons/icon-close.svg?react"
import IconCloseRound from "@/shared/assets/icons/icon-close-rounded.svg"
import ReactPlayer from "react-player"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import classNames from "classnames"
import { useDeleteUserVideo } from "@/entities/user/api/queries.ts"
import { ModerationInfoTooltip } from "@/shared/ui/ModerationInfoTooltip"
import { ACCEPTED_VIDEO_TYPES, MAX_VIDEO_FILE_SIZE } from "@/shared/const/constants.ts"

const ActionMenu = lazy(() =>
  import("@/widgets").then((module) => ({ default: module.ActionMenu })),
)

const validateVideo = (file: File): string | null => {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return "validation.video_type_invalid"
  }
  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return "validation.video_size_too_large"
  }
  return null
}

interface Props {
  file: IUserFile
  replacedFile?: File | null
  onReplace?: (fileId: number, file: File) => void
  onDeleted?: (fileId: number) => void
  hasModerationIssue?: boolean
  rejection_reason?: number | null
}

export const ModerationVideoCard = ({
  file,
  replacedFile,
  onReplace,
  onDeleted,
  hasModerationIssue,
  rejection_reason,
}: Props) => {
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: deleteVideo, isPending: isDeletePending } = useDeleteUserVideo()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [invalidFile, setInvalidFile] = useState<File | null>(null)

  const invalidFileBlobUrl = useMemo(() => {
    if (invalidFile) {
      return URL.createObjectURL(invalidFile)
    }
    return null
  }, [invalidFile])

  const handleReplaceClick = () => {
    triggerImpact()
    fileInputRef.current?.click()
  }

  const handleDeleteClick = () => {
    triggerImpact("light")
    deleteVideo(file.id, {
      onSuccess: () => {
        triggerImpact("medium")
        onDeleted?.(file.id)
      },
    })
  }

  const handleClearInvalidVideo = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerImpact("light")
    setInvalidFile(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const error = validateVideo(selectedFile)
    if (error) {
      setValidationError(error)
      setInvalidFile(selectedFile)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setValidationError(null)
    setInvalidFile(null)

    if (onReplace) {
      onReplace(file.id, selectedFile)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const videoUrl = invalidFile
    ? (invalidFileBlobUrl ?? undefined)
    : replacedFile
      ? URL.createObjectURL(replacedFile)
      : file.url
  const thumbnailUrl = file.thumbnail_url
  const hasError = !!validationError

  const actions = [
    {
      label: "replace",
      icon: <IconPencil />,
      onClick: handleReplaceClick,
    },
    {
      label: "delete",
      icon: <IconClose />,
      onClick: handleDeleteClick,
    },
  ]

  return (
    <div className='relative aspect-[55/72] flex-1 rounded-lg overflow-hidden'>
      {isDeletePending && (
        <div className='absolute inset-0 flex items-center justify-center bg-white-10 z-50 rounded-lg'>
          <div className='loader' />
        </div>
      )}

      <ReactPlayer
        key={videoUrl}
        src={videoUrl}
        playing={false}
        controls={!hasError}
        loop={true}
        light={invalidFile || replacedFile ? false : thumbnailUrl}
        playsInline={true}
        width='100%'
        height='100%'
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          objectFit: "cover",
        }}
        playIcon={<img src={IconPlay} alt='icon-play' />}
      />

      <div
        className={classNames(
          "absolute inset-0 rounded-lg pointer-events-none",
          hasError || hasModerationIssue ? "border-2 border-accent" : "border-1 border-white-10",
        )}
      />

      {validationError && (
        <>
          <ModerationInfoTooltip message={t(validationError)} />
          <button
            type='button'
            className='absolute top-[6px] right-[6px] z-10'
            onClick={handleClearInvalidVideo}
          >
            <img src={IconCloseRound} alt='close' loading='lazy' />
          </button>
        </>
      )}

      {!hasError && hasModerationIssue && rejection_reason && (
        <ModerationInfoTooltip rejectionReason={rejection_reason} />
      )}

      {onReplace && !isDeletePending && !hasError && <ActionMenu actions={actions} />}

      {onReplace && (
        <input
          ref={fileInputRef}
          type='file'
          accept='video/*'
          className='hidden'
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
