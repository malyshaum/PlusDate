import { reasonIcons } from "@/features/SwipeCards/model/constants.ts"
import { Button, LottieComponent } from "@/shared/ui"
import type { SwipeActionFailedReason } from "@/features/SwipeCards/model/types.ts"
import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useTranslation } from "react-i18next"
import revertAnimationIcon from "@/../public/animations/PD_em5.json"
import superlikeAnimationIcon from "@/../public/animations/PD_em3.json"
import { Modal } from "@/widgets/Modal"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent"

interface Props {
  isOpen: boolean
  onClick: () => void
  actionFailedReason: SwipeActionFailedReason | null
}

const getPremiumParam = (param: SwipeActionFailedReason | null) => {
  if (!param) return ""
  if (param === "revert-limit") {
    return "rewind"
  }
  if (param === "superlike-disabled") {
    return "superlike"
  }
}

export const ActionLimitModal = ({ isOpen, onClick, actionFailedReason }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()

  const handleNavigateToPremium = useCallback(() => {
    triggerImpact()
    if (actionFailedReason === "superlike-limit") {
      onClick()
      return
    }
    const param = getPremiumParam(actionFailedReason)
    if (param)
      sendUserEvent({
        event: "select_promotion",
        ecommerce: {
          items: [{ promotion_id: param, promotion_name: param }],
        },
      })
    void navigate(`/premium${param ? `?sourceFeature=${param}` : ""}`)
  }, [actionFailedReason, navigate, onClick, triggerImpact, sendUserEvent])

  useEffect(() => {
    if (!actionFailedReason || actionFailedReason === "superlike-limit") {
      return
    }
    const param = getPremiumParam(actionFailedReason)
    if (param)
      sendUserEvent({
        event: "view_promotion",
        ecommerce: {
          items: [{ promotion_id: param, promotion_name: param }],
        },
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFailedReason])

  if (!actionFailedReason) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClick} className='text-center'>
      {actionFailedReason === "revert-limit" && (
        <div className='mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center mb-6'>
          <LottieComponent animationData={revertAnimationIcon} height={60} width={60} />
        </div>
      )}
      {["superlike-disabled", "superlike-limit", "like-limit"].includes(actionFailedReason) && (
        <div className='mx-auto h-20 w-20 rounded-full bg-premium-gradient flex items-center justify-center mb-6'>
          <LottieComponent animationData={superlikeAnimationIcon} height={60} width={60} />
        </div>
      )}
      {!["revert-limit", "superlike-disabled", "superlike-limit", "like-limit"].includes(
        actionFailedReason,
      ) && <img src={reasonIcons[actionFailedReason]} alt='icon-info' className='mx-auto mb-6' />}
      <h3 className='title1-bold'>{t(`actionLimit.${actionFailedReason}.title`)}</h3>
      <p className='body-regular mt-2'>{t(`actionLimit.${actionFailedReason}.description`)}</p>
      <Button type='button' size='L' className='mt-8' onClick={handleNavigateToPremium}>
        <span>
          {actionFailedReason === "superlike-limit" ? t("ok") : t("actionLimit.getPremiumButton")}
        </span>
      </Button>
    </Modal>
  )
}
