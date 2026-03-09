import classNames from "classnames"
import IconCheckmark from "@/shared/assets/icons/icon-check-small.svg"

interface Props {
  children: React.ReactNode
  isSelected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const PaymentListItem = ({
  children,
  isSelected = false,
  onClick,
  disabled = false,
  className,
}: Props) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "flex items-center justify-between border w-full mb-2 last:mb-0 p-4 h-[72px] rounded-[8px]",
        disabled && "opacity-50",
        isSelected ? "bg-accent" : "bg-white-10",
        isSelected ? "border-accent" : "border-white-10",
        className,
      )}
      style={
        isSelected
          ? {
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(357.76deg, rgba(255, 61, 108, 0.2) 5.15%, rgba(255, 61, 108, 0) 98.1%)",
            }
          : undefined
      }
    >
      {children}
      <span
        className={classNames("h-6 w-6 rounded-[50%] flex items-center justify-center", {
          "bg-white": isSelected,
          "bg-white-10": !isSelected,
        })}
      >
        {isSelected && <img src={IconCheckmark} alt='icon-check' />}
      </span>
    </button>
  )
}
