import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"
import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export interface SwitcherProps {
  value: boolean
  onChange: (value: boolean) => void
  onDisabledClick?: () => void
  label?: string
  className?: string
  disabled?: boolean
}

export const Switcher = ({
  value,
  onChange,
  onDisabledClick,
  label,
  className = "",
  disabled = false,
}: SwitcherProps) => {
  const { triggerImpact } = useHapticFeedback()
  const [internalValue, setInternalValue] = useState(value)

  const debouncedOnChange = useCallback(debounce(onChange, 500), [onChange])

  const handleToggle = () => {
    triggerImpact("light")
    if (disabled && onDisabledClick) {
      onDisabledClick()
      return
    }

    const newValue = !internalValue
    setInternalValue(newValue)
    debouncedOnChange(newValue)
  }

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])

  return (
    <div className={classNames("flex items-center justify-between", className)}>
      {label && <span className='body-regular text-white-70'>{label}</span>}
      <button type='button' onClick={handleToggle} className='relative inline-flex items-center'>
        <div
          className={classNames("w-[50px] h-[28px] rounded-full", {
            "bg-accent": internalValue,
            "bg-white-10": !internalValue,
          })}
        >
          <div
            className={classNames(
              "absolute top-[2px] left-[2px] bg-white-100 rounded-full h-6 w-6 transition-transform",
              {
                "translate-x-[22px]": internalValue,
                "translate-x-0": !internalValue,
                "!bg-white-50": disabled,
              },
            )}
          />
        </div>
      </button>
    </div>
  )
}
