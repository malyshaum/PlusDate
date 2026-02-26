import { useRef, useState, useEffect, type ChangeEvent } from "react"
import classNames from "classnames"
import IconPlus from "@/shared/assets/icons/icon-plus.svg"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_FILE_SIZE } from "@/shared/const/constants.ts"
import type { SlotState } from "@/processes/onboarding/model/schemas.ts"

interface MediaPhotosProps {
  slots: SlotState[]
  onUpload: (file: File, slotIndex: number) => void
  onDelete: (slotIndex: number) => void
  onValidationError?: (error: string | null) => void
  className?: string
}

const validatePhoto = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "validation.image_type_invalid"
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return "validation.image_size_too_large"
  }
  return null
}

const isDuplicate = (file: File, slots: SlotState[], otherFiles: File[]): boolean => {
  const matchesSlot = slots.some((slot) => {
    if (slot.type === "server") {
      return slot.file.filepath === file.name
    }
    if (slot.type === "local") {
      return (
        slot.fileName === file.name &&
        slot.fileSize === file.size &&
        slot.fileLastModified === file.lastModified
      )
    }
    return false
  })

  const matchesBatch = otherFiles.some(
    (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified,
  )

  return matchesSlot || matchesBatch
}

export const MediaPhotos = ({
  slots,
  onUpload,
  onDelete,
  onValidationError,
  className,
}: MediaPhotosProps) => {
  const { triggerImpact } = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    const firstError = Object.values(validationErrors)[0]
    onValidationError?.(firstError ?? null)
  }, [validationErrors, onValidationError])

  const handleSlotClick = (index: number) => {
    const slot = slots[index]
    if (slot.type !== "empty" && !(slot.type === "local" && slot.status === "error")) return

    triggerImpact("medium")
    setActiveSlot(index)
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (activeSlot === null) return

    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const errors: Record<number, string> = {}

    const availableSlotIndices: number[] = []
    for (let i = 0; i < slots.length; i++) {
      const idx = (activeSlot + i) % slots.length
      const slot = slots[idx]
      if (slot.type === "empty" || (slot.type === "local" && slot.status === "error")) {
        availableSlotIndices.push(idx)
      }
    }

    const acceptedFiles: File[] = []

    for (let i = 0; i < Math.min(fileArray.length, availableSlotIndices.length); i++) {
      const file = fileArray[i]
      const slotIndex = availableSlotIndices[i]

      const error = validatePhoto(file)
      if (error) {
        errors[slotIndex] = error
        continue
      }

      if (isDuplicate(file, slots, acceptedFiles)) {
        errors[slotIndex] = "validation.duplicate_photos"
        continue
      }

      acceptedFiles.push(file)
      onUpload(file, slotIndex)
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...errors }))
    }

    e.target.value = ""
    setActiveSlot(null)
  }

  const handleDelete = (index: number) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
    onDelete(index)
  }

  const emptySlotCount = slots.filter(
    (s) => s.type === "empty" || (s.type === "local" && s.status === "error"),
  ).length

  const getSlotImageUrl = (slot: SlotState): string | null => {
    if (slot.type === "server") return slot.file.url
    if (slot.type === "local") return slot.objectUrl
    return null
  }

  return (
    <>
      {slots.map((slot, index) => {
        const imageUrl = getSlotImageUrl(slot)
        const isUploading = slot.type === "local" && slot.status === "uploading"
        const isError = slot.type === "local" && slot.status === "error"
        const error = validationErrors[index]
        const hasImage = slot.type !== "empty"

        return (
          <div
            key={index}
            onClick={() => handleSlotClick(index)}
            className={classNames(
              "h-full w-full relative aspect-[3/4] bg-white-10 border border-white-10 border-dashed rounded-[8px] flex items-center justify-center overflow-hidden",
              className,
              {
                "border-dark-100 border-solid": hasImage && !isError,
                "!border-accent border-solid !border-2": error || isError,
                "cursor-pointer": !hasImage || isError,
                "cursor-not-allowed": isUploading,
              },
            )}
          >
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt='Selected photo'
                  className={classNames("w-full h-full object-cover rounded-[8px]", {
                    "opacity-50": isUploading,
                  })}
                />
                {isUploading && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='loader' />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(index)
                  }}
                  className='absolute top-2 right-2'
                  disabled={isUploading}
                >
                  <img src={IconClose} alt='Remove photo' className='w-4 h-4' />
                </button>
              </>
            ) : (
              <div className='flex flex-col items-center'>
                <img src={IconPlus} alt='icon-plus' />
              </div>
            )}
          </div>
        )
      })}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple={emptySlotCount > 1}
        className='hidden'
        onChange={handleFileChange}
      />
    </>
  )
}
