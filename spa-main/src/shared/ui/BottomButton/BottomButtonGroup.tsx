import { Button } from "@/shared/ui"
import { type ReactNode } from "react"
import classNames from "classnames"
import type { ButtonAppearance } from "@/shared/ui/Button/ui/Button.tsx"

interface Props {
  secondaryButton?: {
    onClick: () => void
    children: ReactNode
    disabled?: boolean
    buttonWrapperClassName?: string
    isLoading?: boolean
    appearance?: ButtonAppearance
  }
  primaryButton?: {
    onClick?: () => void
    children: ReactNode
    disabled?: boolean
    type?: "button" | "submit"
    buttonWrapperClassName?: string
    isLoading?: boolean
    appearance?: ButtonAppearance
  }
  className?: string
  note?: string
}

export const BottomButtonGroup = ({ secondaryButton, primaryButton, className, note }: Props) => {
  return (
    <div
      className={classNames(
        "w-[100vw] pt-8 pb-9 px-4 inset-0 top-auto pb-safe-area-bottom flex flex-col gap-2",
        className,
      )}
      style={{
        background: "linear-gradient(0deg,rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
      }}
    >
      {note && <p className='caption1-medium text-white-50 text-center mb-2'>{note}</p>}
      {primaryButton && (
        <div className={primaryButton.buttonWrapperClassName}>
          <Button
            type={primaryButton.type || "submit"}
            size='L'
            appearance={primaryButton?.appearance ? primaryButton.appearance : "accent"}
            onClick={primaryButton.onClick}
            disabled={primaryButton.disabled}
            isLoading={primaryButton.isLoading}
          >
            {primaryButton.children}
          </Button>
        </div>
      )}
      {secondaryButton && (
        <div className={secondaryButton.buttonWrapperClassName}>
          <Button
            type='button'
            size='L'
            appearance={secondaryButton?.appearance ? secondaryButton.appearance : "white"}
            onClick={secondaryButton.onClick}
            disabled={secondaryButton.disabled}
            isLoading={secondaryButton.isLoading}
          >
            {secondaryButton.children}
          </Button>
        </div>
      )}
    </div>
  )
}
