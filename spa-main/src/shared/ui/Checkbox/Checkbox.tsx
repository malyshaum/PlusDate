import React from "react"
import type { FieldError, Merge } from "react-hook-form"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"
import IconCheckmark from "@/shared/assets/icons/icon-check.svg"
import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export type CheckboxProps = {
  name?: string
  label?: React.ReactNode
  subLabel?: string
  options: {
    value: number | string
    label: React.ReactNode
    icon?: React.ReactNode
  }[]
  error?: FieldError | Merge<FieldError, (FieldError | undefined)[]> | undefined
  className?: string
  classNameOptions?: string
  maxSelections?: number
  currentSelections?: (number | string)[]
  onChange?: (value: (number | string)[]) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  subLabel,
  options,
  error,
  className,
  classNameOptions,
  maxSelections,
  currentSelections = [],
  onChange,
}) => {
  const { triggerImpact } = useHapticFeedback()

  const handleChange = (optionValue: number | string, checked: boolean) => {
    if (!onChange) return
    triggerImpact("light")

    const newSelections = checked
      ? [...currentSelections, optionValue]
      : currentSelections.filter((val) => val !== optionValue)

    onChange(newSelections)
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className='subtitle-medium text-white-70 mb-2'>
          {label} {subLabel && <span className='ml-2 opacity-[50%]'>{subLabel}</span>}
        </label>
      )}
      <div
        className={classNames(
          "flex-1 flex flex-col gap-1 h-full overflow-y-auto pb-safe-area-bottom-with-button",
          classNameOptions,
        )}
      >
        {options.map((opt) => {
          const isSelected = currentSelections.includes(opt.value)
          const isDisabled = Boolean(
            maxSelections && currentSelections.length >= maxSelections && !isSelected,
          )

          return (
            <label
              key={opt.value}
              className={classNames(
                "relative flex items-center justify-between w-full py-[14px] h-[52px] px-3 bg-white-10 rounded-[8px]",
                {
                  "opacity-[50%]": isDisabled,
                },
              )}
            >
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  className='peer sr-only hidden'
                  disabled={isDisabled}
                  onChange={(e) => handleChange(opt.value, e.target.checked)}
                  aria-invalid={error ? "true" : "false"}
                />
                <div className='flex items-center justify-center w-4 h-4 rounded bg-white-10 peer-checked:bg-white-100 peer-checked:[&>img]:block'>
                  <img src={IconCheckmark} alt='icon-checked' className='hidden' />
                </div>
                <span className='body-bold'>{opt.label}</span>
              </div>
              <span>{opt.icon}</span>
            </label>
          )
        })}
      </div>
      {error && <InputError error={error} />}
    </div>
  )
}
