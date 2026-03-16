import { withTranslation, type WithTranslation } from "react-i18next"
import { Button } from "@/shared/ui"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { Modal } from "@/widgets/Modal"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

interface Props extends WithTranslation {
  isOpen: boolean
  onOutsideClick?: () => void
}

const PaymentErrorBase = ({ t, isOpen, onOutsideClick }: Props) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()

  const handleNavigate = () => {
    onOutsideClick?.()
    triggerImpact()
    sendUserEvent({ event: "premium_screen_opened", source: "other" })
    void navigate("/premium")
  }

  return (
    <Modal isOpen={isOpen} onClose={onOutsideClick} className='text-center'>
      <div className='text-[75px] font-extrabold leading-[100%] mb-6'>😭</div>
      <h6 className='title1-bold mb-2'>{t("premium.payment.error.title")}</h6>
      <p className='body-regular mb-6'>{t("premium.payment.error.description")}</p>
      <Button size='L' onClick={handleNavigate} className='button-main'>
        {t("premium.payment.error.button")}
      </Button>
    </Modal>
  )
}

export const PaymentError = withTranslation()(PaymentErrorBase)
