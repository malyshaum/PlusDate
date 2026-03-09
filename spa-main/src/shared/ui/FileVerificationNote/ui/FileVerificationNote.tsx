import classNames from "classnames"
import type { PropsWithChildren } from "react"

interface Props extends PropsWithChildren {
  type: "attention" | "info"
  enableTicker?: boolean
}

export const FileVerificationNote = ({ type, children, enableTicker = true }: Props) => {
  return (
    <div
      className={classNames(
        "absolute inset-0 top-auto overflow-hidden py-1",
        type === "attention" ? "bg-attention" : "bg-grey-50",
      )}
    >
      <div className={classNames(enableTicker ? "ticker-wrap" : "text-center")}>
        <div className={classNames("subtitle-medium", { "animate-ticker": enableTicker })}>
          {children}
        </div>
      </div>
    </div>
  )
}
