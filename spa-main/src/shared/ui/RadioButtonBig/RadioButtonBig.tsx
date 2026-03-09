import classNames from "classnames"
import IconCheckmark from "@/shared/assets/icons/icon-check-small.svg"

interface RadioButtonBigProps {
  children: React.ReactNode
  isSelected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const RadioButtonBig = ({
  children,
  isSelected = false,
  onClick,
  disabled = false,
  className,
}: RadioButtonBigProps) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "flex items-center justify-between text-left bg-white-10 w-full mb-1 px-4 py-[14px] rounded-[8px]",
        disabled && "opacity-50",
        className,
      )}
    >
      {children}
      {isSelected && (
        <span className='h-6 w-6 rounded-[50%] bg-white flex items-center justify-center'>
          <img src={IconCheckmark} alt='icon-check' />
        </span>
      )}
    </button>
  )
}
