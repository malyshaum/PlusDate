import IconCheck from "@/shared/assets/icons/icon-check-rounded-small.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import classNames from "classnames"

interface SelectionButtonProps {
  emoji: string
  title: string
  checked: boolean
  hasSelection?: boolean
  onChange: () => void
}

export const SelectionButton = ({ emoji, title, checked, hasSelection, onChange }: SelectionButtonProps) => {
  const { triggerImpact } = useHapticFeedback()

  const handleClick = () => {
    triggerImpact()
    onChange()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className='flex h-[52px] items-center justify-between rounded-lg bg-white-10 px-4'
    >
      <span className='flex items-center gap-2'>
        <span>{emoji}</span>
        <span className={classNames("body-bold", checked ? "text-white-100" : hasSelection ? "text-white-50" : "text-white-100")}>
          {title}
        </span>
      </span>
      {checked && <IconCheck />}
    </button>
  )
}
