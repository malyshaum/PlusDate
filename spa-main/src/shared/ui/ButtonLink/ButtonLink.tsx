import { NavLink } from "react-router-dom"
import classNames from "classnames"
import IconLock from "@/shared/assets/icons/icon-lock.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { MouseEvent } from "react"

interface ButtonLinkProps {
  to: string
  icon?: React.ReactNode
  children: React.ReactNode
  rightElement?: React.ReactNode
  variant?: "default" | "accent"
  className?: string
  showIndicator?: boolean
  disabled?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

export const ButtonLink = ({
  to,
  icon,
  children,
  rightElement,
  variant = "default",
  className,
  showIndicator,
  disabled = false,
  style,
  onClick,
}: ButtonLinkProps) => {
  const { triggerImpact } = useHapticFeedback()

  const handleClick = (e: MouseEvent) => {
    triggerImpact()
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <NavLink
      to={to}
      className={classNames(
        "relative flex gap-2 items-center px-4 py-[14px] body-bold rounded-[8px]",
        variant === "default" && "bg-white-10",
        variant === "accent" && "bg-accent-gradient",
        showIndicator && "bg-button-link-warning",
        disabled && "pointer-events-none opacity-30",
        className,
      )}
      onClick={handleClick}
      style={style}
    >
      {showIndicator && !disabled && (
        <div className='absolute right-1 top-1 bg-attention h-2 w-2 rounded-full z-1' />
      )}
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {rightElement && !disabled && <span className='ml-auto'>{rightElement}</span>}
      {disabled && <IconLock className='ml-auto' />}
    </NavLink>
  )
}
