import { Button } from "@/shared/ui"
import { useNavigate } from "react-router-dom"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useEffect } from "react"

export const SwipeLimitReachedBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()

  const navigateToPremium = () => {
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
    })
    void navigate("/premium")
  }

  useEffect(() => {
    sendUserEvent({
      event: "view_promotion",
      ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex items-center flex-col justify-center h-full'>
      <div className='text-center mb-4 text-[75px]'>😭</div>
      <div className='text-center mb-4'>
        <p className='title1-bold mb-1'>{t("swipe.limitReached.title")}</p>
        <p className='caption1-medium text-white-50'>{t("swipe.limitReached.subtitle")}</p>
      </div>
      <Button size='L' onClick={navigateToPremium}>
        {t("swipe.limitReached.getPremium")}
      </Button>
    </div>
  )
}

export const SwipeLimitReached = withTranslation()(SwipeLimitReachedBase)
