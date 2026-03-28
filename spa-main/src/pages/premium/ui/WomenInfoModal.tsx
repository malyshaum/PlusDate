import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import TextPlusDate from "@/pages/premium/assets/plus-date.svg"
import { Modal } from "@/widgets/Modal"
import { useCurrentSubscription } from "@/pages/premium/api/query"

export const WomenInfoModal = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const [searchParams] = useSearchParams()
  const { refetch, isLoading, isFetching } = useCurrentSubscription()
  const initialWomenStart = searchParams.get("initialWomenStart")

  const handleDismiss = async () => {
    triggerImpact()
    await refetch()
    void navigate("/feed")
  }

  return (
    <Modal isOpen={!!initialWomenStart} onClose={handleDismiss} className='text-center'>
      <img src={TextPlusDate} alt='plus-date-premium' className='mx-auto block' />
      <p className='body-regular mt-4'>{t("premium.womenFreeInfo")}</p>
      <Button
        type='button'
        size='L'
        className='mt-6'
        onClick={handleDismiss}
        isLoading={isLoading || isFetching}
      >
        {t("start")}
      </Button>
    </Modal>
  )
}
