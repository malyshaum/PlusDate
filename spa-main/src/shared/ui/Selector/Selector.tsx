import React from "react"
import type { FieldError } from "react-hook-form"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"
import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export type SelectorProps = {
  name?: string
  label?: React.ReactNode
  options: {
    value: string
    label: React.ReactNode
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
    emoji?: string
  }[]
  error?: FieldError | string
  className?: string
  direction?: "column" | "row"
  variant?: "default" | "emoji"
  value?: string | null
  onChange?: (value: string) => void
}
export const Selector: React.FC<SelectorProps> = ({
  name,
  label,
  options,
  error,
  className,
  direction = "row",
  variant = "default",
  value,
  onChange,
  ...props
}) => {
  const { triggerImpact } = useHapticFeedback()

  const handleChange = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue)
      triggerImpact("light")
    }
  }

  return (
    <div className={className} {...props}>
      {label && <div className='subtitle-medium text-white-70 mb-2'>{label}</div>}
      <div
        className={classNames("flex gap-[10px]", {
          "flex-col": direction === "column",
          "gap-1": variant === "emoji",
        })}
      >
        {options.map((opt) => {
          const Icon = opt?.icon
          const isSelected = value === opt.value

          if (variant === "emoji") {
            return (
              <label
                key={opt.value}
                className='h-[52px] relative flex items-center justify-between w-full py-[14px] px-3 bg-white-10 rounded-[8px] cursor-pointer'
              >
                <input
                  type='radio'
                  name={name}
                  className='peer sr-only'
                  value={opt.value}
                  checked={isSelected}
                  onChange={(e) => handleChange(e.target.value)}
                  aria-invalid={error ? "true" : "false"}
                />
                <span
                  className={classNames("body-bold", {
                    "text-accent": isSelected,
                  })}
                >
                  {opt.label}
                </span>
                <span className='title1-bold'>{opt.emoji}</span>
              </label>
            )
          }

          return (
            <label
              key={opt.value}
              className={classNames(
                "h-[52px] relative flex items-center justify-center gap-1 w-full py-[14px] px-2 rounded-[8px]",
                {
                  "bg-white-10": !isSelected,
                  "bg-accent-gradient": isSelected,
                },
              )}
            >
              <input
                type='radio'
                name={name}
                className='peer sr-only'
                value={opt.value}
                checked={isSelected}
                onChange={(e) => handleChange(e.target.value)}
                aria-invalid={error ? "true" : "false"}
              />
              {Icon && <Icon height={24} width={24} />}
              <span className='button-main'>{opt.label}</span>
            </label>
          )
        })}
      </div>
      {error && <InputError error={error} />}
    </div>
  )
}
