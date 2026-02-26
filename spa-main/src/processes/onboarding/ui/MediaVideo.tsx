import { useRef, useState, useMemo, useEffect, type ChangeEvent } from "react"
import classNames from "classnames"
import IconVideo from "@/shared/assets/icons/icon-video-upload.svg"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import IconCloseRound from "@/shared/assets/icons/icon-close-rounded.svg"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { IUserFile } from "@/entities/user/model/types.ts"
import { ACCEPTED_VIDEO_TYPES, MAX_VIDEO_FILE_SIZE } from "@/shared/const/constants.ts"
import { useTranslation } from "react-i18next"
import IconPlay from "@/shared/assets/icons/icon-play.svg"
import ReactPlayer from "react-player"


interface MediaVideoProps {
  video?: IUserFile
  onUpload: (file: File) => Promise<void>
  onDelete: (fileId: number) => Promise<void>
  onValidationError?: (error: string | null) => void
  className?: string
}

const validateVideo = (file: File): string | null => {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return "validation.video_type_invalid"
  }
  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return "validation.video_size_too_large"
  }
  return null
}

export const MediaVideo = ({ video, onUpload, onDelete, onValidationError, className }: MediaVideoProps) => {
  const { triggerImpact } = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [invalidFile, setInvalidFile] = useState<File | null>(null)

  useEffect(() => {
    onValidationError?.(validationError)
  }, [validationError, onValidationError])

  const invalidFileBlobUrl = useMemo(() => {
    if (invalidFile) {
      return URL.createObjectURL(invalidFile)
    }
    return null
  }, [invalidFile])

  const handleClick = () => {
    if (video || isUploading || invalidFile) return

    triggerImpact("medium")
    setValidationError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateVideo(file)
    if (error) {
      setValidationError(error)
      setInvalidFile(file)
      e.target.value = ""
      return
    }

    setIsUploading(true)
    setValidationError(null)
    setInvalidFile(null)

    try {
      await onUpload(file)
      setIsUploading(false)
    } catch (error) {
      console.error(error)
      setIsUploading(false)
      setValidationError("Upload failed")
    }

    e.target.value = ""
  }

  const handleDelete = async () => {
    if (!video) return

    try {
      await onDelete(video.id)
      setValidationError(null)
    } catch (error) {
      console.error(error)
      setValidationError("Delete failed")
    }
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

  return (
    <>
      <div
        onClick={handleClick}
        className={classNames(
          "relative aspect-[3/4] bg-white-5 rounded-[8px] flex items-center justify-center overflow-hidden",
          className,
          {
            "border-dark-100 border-solid": video,
            "border-2 border-accent": validationError,
            "cursor-pointer": !video && !isUploading && !invalidFile,
            "cursor-not-allowed": isUploading,
          },
        )}
      >
        {video ? (
          <>
            <ReactPlayer
              src={video.url}
              playing={true}
              controls={true}
              loop={true}
              light={video?.thumbnail_url}
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
            <button
              onClick={(e) => {
                e.stopPropagation()
                void handleDelete()
              }}
              className='absolute top-2 right-2 z-2'
              disabled={isUploading}
            >
              <img src={IconClose} alt='Remove video' className='w-4 h-4' />
            </button>
          </>
        ) : invalidFile && invalidFileBlobUrl ? (
          <>
            <ReactPlayer
              src={invalidFileBlobUrl}
              playing={false}
              controls={false}
              loop={true}
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
            <button
              type='button'
              className='absolute top-[6px] right-[6px] z-10'
              onClick={handleClearInvalidVideo}
            >
              <img src={IconCloseRound} alt='close' loading='lazy' />
            </button>
          </>
        ) : isUploading ? (
          <div className='loader' />
        ) : (
          <div className='flex flex-col items-center justify-center gap-1'>
            <img src={IconVideo} alt='icon-video' />
            <div className='subtitle-medium mt-1 text-white-50 !capitalize'>{t("onboarding.media.addVideo")}</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept={ACCEPTED_VIDEO_TYPES.join(",")}
        className='hidden'
        onChange={handleFileChange}
      />
    </>
  )
}
