import type { ReactNode } from "react"
import { Button } from "@/shared/ui"
import { Modal } from "@/widgets/Modal"

interface Props {
  isOpen: boolean
  icon?: ReactNode
  title: string
  description?: string
  primaryButton: {
    children: ReactNode
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
  }
  secondaryButton?: {
    children: ReactNode
    onClick: () => void
    disabled?: boolean
  }
  onOutsideClick?: () => void
  children?: ReactNode
}

export const ConfirmationModal = ({
  isOpen,
  icon,
  title,
  description,
  primaryButton,
  secondaryButton,
  onOutsideClick,
  children,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onOutsideClick} className='text-center'>
      {icon && <div className='mb-6 mx-auto w-fit'>{icon}</div>}
      <h6 className='title1-bold mb-2'>{title}</h6>
      {description && <p className='body-regular mb-6'>{description}</p>}
      {children}
      <div className='flex flex-col gap-3'>
        <Button
          size='L'
          onClick={primaryButton.onClick}
          disabled={primaryButton.disabled}
          isLoading={primaryButton.isLoading}
          className='button-main'
        >
          {primaryButton.children}
        </Button>
        {secondaryButton && (
          <Button
            size='L'
            appearance='white'
            onClick={secondaryButton.onClick}
            disabled={secondaryButton.disabled}
          >
            {secondaryButton.children}
          </Button>
        )}
      </div>
    </Modal>
  )
}
