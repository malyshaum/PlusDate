import { withTranslation, type WithTranslation } from "react-i18next"
import { PaymentListItem } from "@/shared/ui"
import { payments, type PaymentMethod } from "@/pages/premium/lib/constants"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"

interface PaymentBlockProps extends WithTranslation {
  selectedPayment: PaymentMethod
  onPaymentSelect: (payment: PaymentMethod) => void
}

const PaymentBlockBase = ({ t, selectedPayment, onPaymentSelect }: PaymentBlockProps) => {
  const { triggerImpact } = useHapticFeedback()

  const handlePaymentSelect = (paymentId: PaymentMethod) => {
    triggerImpact()
    onPaymentSelect(paymentId)
  }

  return (
    <div className='mt-4 px-4'>
      {payments.map((payment) => (
        <PaymentListItem
          key={payment.id}
          isSelected={selectedPayment === payment.id}
          onClick={() => handlePaymentSelect(payment.id)}
        >
          <div className='flex items-center gap-4'>
            <img src={payment.icon} alt={t(payment.titleKey)} className='w-10 h-10' />
            <div className='text-left'>
              <div className='body-bold'>{t(payment.titleKey)}</div>
              <div className='subtitle-medium-no-caps text-white-50 mt-1'>
                {t(payment.subtitleKey)}
              </div>
            </div>
          </div>
        </PaymentListItem>
      ))}
    </div>
  )
}

export const PaymentBlock = withTranslation()(PaymentBlockBase)
