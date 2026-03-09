import classNames from "classnames"

interface Props {
  type?: "yellow" | "grey" | "cta"
  size?: "M" | "L"
  children?: React.ReactNode
  onClick?: () => void
}

export const SwipeButton = ({ type = "cta", size = "M", children, onClick }: Props) => {
  return (
    <button
      type='button'
      className={classNames(
        "rounded-[16px] flex items-center justify-center w-full",
        {
          "liquid-glass relative": type === "grey",
        },
        { "bg-premium-gradient": type === "yellow" },
        { "bg-accent-gradient": type === "cta" },
        { "h-[56px]": size === "L" },
        { "h-11": size === "M" },
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
