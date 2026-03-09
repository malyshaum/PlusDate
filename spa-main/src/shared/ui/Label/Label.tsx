import { type ReactNode } from "react"
import classNames from "classnames"

interface Props {
  icon?: ReactNode
  value?: number | string | null | ReactNode
  className?: string
  shouldCapitalize?: boolean | "none"
  onClick?: () => void
}

export const Label = ({ icon, value, className = "", shouldCapitalize = true, onClick }: Props) => {
  if (!value) return null

  return (
    <div
      className={classNames(
        "flex flex-nowrap gap-1 items-center py-1 px-2 rounded-[40px] bg-grey-75 border border-white-10 shadow-[inset_1px_1px_2px_rgba(255,255,255,.3)]",
        shouldCapitalize === true ? "subtitle-medium" : "subtitle-medium-no-caps",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      {icon}
      <span
        className={classNames(
          "truncate min-w-0",
          shouldCapitalize !== "none" && "lowercase",
          { "first-letter:uppercase": shouldCapitalize === true },
          className,
        )}
      >
        {value}
      </span>
    </div>
  )
}
