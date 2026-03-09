import { Modal } from "@/widgets/Modal"
import { Button } from "@/shared/ui"
import { useReportSuccessModal } from "@/shared/lib/useReportSuccessModal"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { useTranslation } from "react-i18next"

export const ReportSuccessModal = () => {
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const { isOpen, hideModal } = useReportSuccessModal()

  const handleClose = () => {
    triggerImpact()
    hideModal()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className='text-center'>
      <h6 className='title1-bold mb-2'>{t("profileReport.successModal.title")}</h6>
      <p className='body-regular mb-6'>{t("profileReport.successModal.description")}</p>
      <Button size='L' onClick={handleClose} className='w-full'>
        {t("profileReport.successModal.okButton")}
      </Button>
    </Modal>
  )
}
