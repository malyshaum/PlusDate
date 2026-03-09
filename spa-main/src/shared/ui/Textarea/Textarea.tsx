import React, { useEffect, useRef, useCallback, useState } from "react"
import type { Path, UseFormRegister, FieldError, FieldValues } from "react-hook-form"
import classNames from "classnames"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"

export type TextareaFieldProps<T extends FieldValues> = {
  name: Path<T>
  label?: string
  subLabel?: string
  type?: "square" | "rounded"
  appearance?: "default" | "liquid-glass"
  register: UseFormRegister<T>
  error?: FieldError
  className?: string
  childrenBefore?: React.ReactNode
  placeholder?: string
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onBlurCapture?: () => void
  disabled?: boolean
  note?: string
  spellCheck?: boolean
  onInput?: () => void
}

export const TextareaField = <T extends FieldValues>({
  name,
  label,
  subLabel,
  type = "square",
  appearance = "default",
  register,
  error,
  className,
  childrenBefore,
  placeholder,
  onFocus,
  onBlurCapture,
  disabled = false,
  note,
  spellCheck,
  onInput,
}: TextareaFieldProps<T>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { ref: hookFormRef, ...registerProps } = register(name)
  const [isMultiLine, setIsMultiLine] = useState(false)

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      const minHeight = type === "rounded" ? 46 : 64

      if (textarea.value.trim() === "") {
        textarea.style.height = `${minHeight}px`
        setIsMultiLine(false)
        return
      }

      const currentHeight = parseInt(textarea.style.height || `${minHeight}`)

      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = "auto"
        const newHeight = Math.max(textarea.scrollHeight, minHeight)
        textarea.style.height = `${newHeight}px`
        setIsMultiLine(newHeight > minHeight)
      } else if (currentHeight > minHeight) {
        textarea.style.height = `${minHeight}px`
        if (textarea.scrollHeight > minHeight) {
          textarea.style.height = "auto"
          const newHeight = textarea.scrollHeight
          textarea.style.height = `${newHeight}px`
          setIsMultiLine(true)
        } else {
          setIsMultiLine(false)
        }
      } else {
        textarea.style.height = `${minHeight}px`
        setIsMultiLine(false)
      }
    }
  }, [type])

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const observer = new MutationObserver(() => {
      adjustHeight()
    })

    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ["value"],
    })

    const interval = setInterval(() => {
      if (textarea.value === "" && textarea.style.height !== `${type === "rounded" ? 46 : 64}px`) {
        adjustHeight()
      }
    }, 100)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [adjustHeight, type])

  return (
    <div className={classNames("w-full flex flex-col z-2 relative", className)}>
      {label && (
        <label htmlFor={name} className='subtitle-medium text-white-70 mb-2'>
          {label} {subLabel && <span className='ml-2 opacity-[50%]'>{subLabel}</span>}
        </label>
      )}
      <div
        className={classNames("flex items-start gap-2relative", {
          "border-attention": error,
          "border-transparent": !error,
          "rounded-[8px]": type === "square",
          "rounded-[42px]": type === "rounded" && !isMultiLine,
          "rounded-[16px]": type === "rounded" && isMultiLine,
          "bg-grey-75 border border-white-10 shadow-[inset_1px_1px_2px_rgba(255,255,255,.3)]":
            appearance === "liquid-glass",
          "border-2 bg-white-10": appearance === "default",
        })}
      >
        {childrenBefore}
        <textarea
          ref={(e) => {
            hookFormRef(e)
            textareaRef.current = e
          }}
          id={name}
          {...registerProps}
          aria-invalid={error ? "true" : "false"}
          placeholder={placeholder}
          onInput={() => {
            adjustHeight()
            onInput?.()
          }}
          onFocus={onFocus}
          onBlurCapture={onBlurCapture}
          disabled={disabled}
          spellCheck={spellCheck}
          className={classNames(
            "flex-1 body-regular placeholder:text-white-50 outline-0 resize-none px-4",
            {
              "py-[14.5px]": type === "square",
              "py-[13.5px]": type === "rounded",
              "text-white-50": disabled,
            },
          )}
        />
      </div>
      {note && !error && <p className='caption1-medium mt-1 text-text-grey'>{note}</p>}
      {error && <InputError error={error} />}
    </div>
  )
}
