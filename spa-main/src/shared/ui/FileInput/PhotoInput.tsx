import { useRef, type MouseEvent, type ChangeEvent } from "react"
import { type Path, type FieldValues, Controller, type Control } from "react-hook-form"
import classNames from "classnames"
import IconPlus from "@/shared/assets/icons/icon-plus.svg"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import { PhotoPreview } from "@/shared/ui/FileInput/FilePhotoPreview.tsx"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export type PhotoInputProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  className?: string
  inputBoxClassName?: string
  allowMultiple?: boolean
  onMultipleFiles?: (remainingFiles: File[], currentSlot: Path<T>) => void
}

export const PhotoInput = <T extends FieldValues>({
  name,
  control,
  className,
  inputBoxClassName,
  allowMultiple = false,
  onMultipleFiles,
}: PhotoInputProps<T>) => {
  const { triggerImpact } = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    triggerImpact("medium")
    fileInputRef.current?.click()
  }

  const handleRemove = (e: MouseEvent, onChange: (value: File | null) => void) => {
    e.stopPropagation()
    onChange(null)
  }

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void,
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    if (fileArray[0]) {
      onChange(fileArray[0])
    }

    if (allowMultiple && fileArray.length > 1 && onMultipleFiles) {
      const remainingFiles = fileArray.slice(1)
      onMultipleFiles(remainingFiles, name)
    }

    e.target.value = ""
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={classNames("w-full flex flex-col h-full", className)}>
          <div
            onClick={handleClick}
            className={classNames(
              "h-full w-full relative aspect-square bg-white-10 border border-white-10 border-dashed rounded-[8px] flex items-center justify-center overflow-hidden",
              {
                "border-dark-100 border-solid": value,
                "!border-attention border-solid !border-2": error,
              },
              inputBoxClassName,
            )}
          >
            {value ? (
              <>
                <PhotoPreview
                  file={value}
                  alt='Selected photo'
                  className={classNames(
                    "w-full h-full object-cover rounded-[8px]",
                    inputBoxClassName,
                  )}
                />
                <button
                  onClick={(e) => handleRemove(e, onChange)}
                  className='absolute top-2 right-2'
                >
                  <img src={IconClose} alt='Remove photo' className='w-4 h-4' />
                </button>
              </>
            ) : (
              <div className='flex flex-col items-center'>
                <img src={IconPlus} alt='icon-plus' />
              </div>
            )}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              multiple={allowMultiple}
              className='hidden'
              onChange={(e) => handleFileChange(e, onChange)}
            />
          </div>
        </div>
      )}
    />
  )
}
