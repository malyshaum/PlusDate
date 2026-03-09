import classNames from "classnames"
import type { CSSProperties } from "react"

interface Props {
  path: string
  className?: string
  onClick?: () => void
  style?: CSSProperties
  disabled?: boolean
}

export const ButtonIcon = ({ path, onClick, className, style, disabled }: Props) => {
  return (
    <button
      className={classNames("w-fit", className, { "pointer-events-none": disabled })}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      <img src={path} alt='icon-button' />
    </button>
  )
}
