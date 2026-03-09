import { useState } from "react"
import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[]
  onChange: (value: string) => void
  className?: string
  value?: string
  disabled?: boolean
}

export const Tabs = ({
  options,
  onChange,
  className,
  value: controlledValue,
  disabled = false,
}: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const [internalValue, setInternalValue] = useState(options[0].value)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleChange = (newValue: string) => {
    if (disabled) return
    triggerImpact()
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange(newValue)
  }

  return (
    <div className='flex gap-2'>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          disabled={disabled}
          className={classNames(
            "w-full p-2 rounded-lg button-main",
            {
              "bg-accent": value === option.value,
              "bg-white-20": value !== option.value,
            },
            className,
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
