import IconTimeout from "@/shared/assets/icons/icon-timer.svg?react"
import Countdown from "react-countdown"
import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { useCallback, useEffect, useRef } from "react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useNavigate } from "react-router-dom"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { useUser } from "@/entities/user/api/queries"
import classNames from "classnames"

interface Props {
  timeout?: string
  onComplete?: () => void
  showBorder?: boolean
}

export const Timeout = ({ timeout, onComplete, showBorder = true }: Props) => {
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()
  const { data: user } = useUser()
  const isMountedRef = useRef(false)

  const handleNavigateToPremium = useCallback(() => {
    triggerImpact()
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
    })
    void navigate("/premium")
  }, [navigate, triggerImpact, sendUserEvent])

  const countdownRenderer = useCallback(
    ({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }) => {
      const formattedTime =
        hours > 0
          ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
          : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

      return <span>{formattedTime}</span>
    },
    [],
  )

  useEffect(() => {
    if (user?.feed_profile?.age && user?.feed_profile?.sex) {
      if (isMountedRef.current) {
        return
      }
      isMountedRef.current = true
      sendUserEvent({
        event: "swipe_limit_exceeded",
        age: user?.feed_profile.age,
        gender: user?.feed_profile.sex,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.feed_profile.age, user?.feed_profile.sex])

  const handleCountdownComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  return (
    <div
      className={classNames(
        "absolute inset-0 rounded-3xl flex flex-col text-center z-999 p-3",
        showBorder ? "border border-[#212121]/15" : "",
      )}
    >
      <div className='flex-1 flex items-center justify-center flex-col'>
        <IconTimeout className='mb-4' />
        <h1 className='title1-bold mb-2'>{t("timeout.title")}</h1>
        <p className='body-regular text-white-50'>
          {t("timeout.description")}{" "}
          <Countdown
            date={timeout}
            renderer={countdownRenderer}
            onComplete={handleCountdownComplete}
          />
        </p>
      </div>
      <Button size='L' onClick={handleNavigateToPremium} className='w-full'>
        {t("timeout.continueButton")}
      </Button>
    </div>
  )
}
