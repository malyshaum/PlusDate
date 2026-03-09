import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

interface RadioTextProps {
  isSelected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  dimmed?: boolean
  icon?: string
  title: string
}

export const RadioText = ({
  isSelected = false,
  onClick,
  disabled = false,
  className,
  dimmed = false,
  icon,
  title,
}: RadioTextProps) => {
  const { triggerImpact } = useHapticFeedback()

  const handleClick = () => {
    if (disabled) return
    triggerImpact("light")
    onClick?.()
  }

  return (
    <li
      className={classNames(
        "relative flex items-center gap-2 w-full cursor-pointer py-[14px] px-4 bg-white-10 transition rounded-[8px]",
        {
          "opacity-[50%]": dimmed,
          "text-accent opacity-[100%]": isSelected,
        },
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={handleClick}
    >
      <img src={icon} alt={`${title}-icon`} />
      <span className='font-medium leading-[24px]'>{title}</span>
    </li>
  )
}
