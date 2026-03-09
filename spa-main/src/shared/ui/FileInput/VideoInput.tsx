import { type MouseEvent, useRef } from "react"
import {
  type Path,
  type FieldError,
  type FieldValues,
  Controller,
  type Control,
} from "react-hook-form"
import classNames from "classnames"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"
import IconPlus from "@/shared/assets/icons/icon-plus.svg"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { VideoPreview } from "@/shared/ui/FileInput/FileVideoPreview.tsx"

export type VideoInputProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  error?: FieldError
  className?: string
  label?: string
  subLabel?: string
  inputContainerClassName?: string
}

export const VideoInput = <T extends FieldValues>({
  name,
  control,
  error,
  className,
  label,
  subLabel,
  inputContainerClassName,
}: VideoInputProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerImpact } = useHapticFeedback()

  const handleClick = () => {
    triggerImpact("medium")
    fileInputRef.current?.click()
  }

  const handleRemove = (e: MouseEvent, onChange: (value: File | null) => void) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        return (
          <div className={classNames("w-full flex flex-col", className)}>
            {label && (
              <label htmlFor={name} className='subtitle-medium text-white-70 mb-2'>
                {label} {subLabel && <span className='ml-2 opacity-[50%]'>{subLabel}</span>}
              </label>
            )}
            <div
              onClick={handleClick}
              className={classNames(
                "relative aspect-auto bg-white-10 border-1 border-dashed border-white-10 rounded-[8px] flex items-center justify-center overflow-hidden",
                inputContainerClassName,
              )}
            >
              {value ? (
                <>
                  <VideoPreview file={value} />
                  <button
                    onClick={(e) => handleRemove(e, onChange)}
                    className='absolute top-2 right-2'
                  >
                    <img src={IconClose} alt='Remove photo' className='w-4 h-4' />
                  </button>
                </>
              ) : (
                <img src={IconPlus} alt='icon-plus' />
              )}
              <input
                ref={fileInputRef}
                name={name}
                type='file'
                accept='video/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  onChange(file || null)
                }}
              />
            </div>
            {error && <InputError error={error} />}
          </div>
        )
      }}
    />
  )
}
