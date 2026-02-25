import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BottomButton, ButtonLink, LottieComponent } from "@/shared/ui"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import IconHeart from "@/shared/assets/icons/icon-heart.svg?react"
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react"
import { useQueryClient } from "@tanstack/react-query"
import { USER_KEYS, useUser } from "@/entities/user/api/queries.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import AnimationData from "@/../public/animations/PD_em1.json"
import { ESex } from "@/shared/types/common.ts"
import { useEffect } from "react"

const ModerationSplashBase = ({ t }: WithTranslation) => {
  const { data: user } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()
  const fromOnboarding = searchParams.get("fromOnboarding")

  const handleContinue = async () => {
    triggerImpact("medium")
    await queryClient.invalidateQueries({
      queryKey: [USER_KEYS.user, USER_KEYS.me],
    })
    if (fromOnboarding && user?.feed_profile.sex === ESex.female) {
      sendUserEvent({
        event: "select_promotion",
        ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
      })
      await navigate("/premium?initialWomenStart=1")
      return
    }
    await navigate("/feed")
  }

  useEffect(() => {
    sendUserEvent({
      event: "view_promotion",
      ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className='flex flex-col h-full overflow-auto'>
      <div className='flex-1 flex flex-col items-center justify-center px-4'>
        <div className='mx-auto h-20 w-20 rounded-full bg-icon-gradient flex items-center justify-center mb-2'>
          <LottieComponent animationData={AnimationData} width={48} height={48} />
        </div>
        <h1 className='title1-bold text-center mb-1'>{t("moderationSplash.title")}</h1>
        <p className='caption1-medium text-center opacity-50'>
          {t("moderationSplash.description")}
        </p>
      </div>
      <div>
        <div className='mx-4 mb-[-16px] px'>
          <ButtonLink
            to='https://t.me/PlusDateNews'
            icon={<IconHeart />}
            rightElement={<ChevronIcon />}
          >
            {t("news")}
          </ButtonLink>
        </div>
        <BottomButton onClick={handleContinue} className='pb-safe-area-bottom static'>
          <span className='button-main'>{t("startWithLimitations")}</span>
        </BottomButton>
      </div>
    </main>
  )
}

export const ModerationSplash = withTranslation()(ModerationSplashBase)
