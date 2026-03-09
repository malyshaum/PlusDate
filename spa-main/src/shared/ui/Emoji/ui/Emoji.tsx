import classNames from "classnames"

interface Props {
  emoji: string
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const Emoji = ({ emoji, className, onClick, disabled }: Props) => {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center font-extrabold text-[16px] bg-white-10 border border-white-5 h-10 rounded-3xl",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {emoji}
    </button>
  )
}
