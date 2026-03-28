import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { Modal } from "@/widgets/Modal"

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const TributeConfirmModal = ({ isOpen, onConfirm, onCancel, isLoading }: Props) => {
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()

  const handleConfirm = () => {
    triggerImpact()
    onConfirm()
  }

  const handleCancel = () => {
    triggerImpact()
    onCancel()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} className='text-center'>
      <p className='body-regular mb-6'>{t("premium.tributeConfirm.description")}</p>
      <div className='flex flex-col gap-3 mt-6'>
        <Button type='button' size='L' onClick={handleConfirm} isLoading={isLoading}>
          {t("premium.tributeConfirm.confirm")}
        </Button>
        <Button type='button' size='L' appearance='white' onClick={handleCancel}>
          {t("cancel")}
        </Button>
      </div>
    </Modal>
  )
}
