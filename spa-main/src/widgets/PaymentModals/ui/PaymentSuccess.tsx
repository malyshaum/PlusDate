import { withTranslation, type WithTranslation } from "react-i18next"
import { Button } from "@/shared/ui"
import { useNavigate } from "react-router-dom"
import TextPlusDate from "@/pages/premium/assets/plus-date.svg"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { Modal } from "@/widgets/Modal"
import { usePaymentModal } from "@/shared/lib/usePaymentModal"
import type { Range } from "@/pages/premium/model/types"

interface Props extends WithTranslation {
  isOpen: boolean
  onOutsideClick: () => void
}

const getSubscriptionDuration = (subscriptionType: Range | null): string => {
  switch (subscriptionType) {
    case "three_days":
      return "3days"
    case "week":
      return "7days"
    case "month":
      return "30days"
    case "three_month":
      return "3months"
    default:
      return "default"
  }
}

const PaymentSuccessBase = ({ t, isOpen, onOutsideClick }: Props) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const { subscriptionType } = usePaymentModal()
  const durationKey = getSubscriptionDuration(subscriptionType || null)

  const handleNavigate = () => {
    onOutsideClick()
    triggerImpact()
    void navigate("/feed")
  }

  return (
    <Modal isOpen={isOpen} onClose={onOutsideClick} className='text-center'>
      <img src={TextPlusDate} alt='plus-date-premium' className='mx-auto block mb-5' />
      <p className='body-regular mb-6'>{t(`premium.payment.success.description.${durationKey}`)}</p>
      <Button size='L' onClick={handleNavigate} className='button-main'>
        {t("premium.payment.success.button")}
      </Button>
    </Modal>
  )
}

export const PaymentSuccess = withTranslation()(PaymentSuccessBase)
