import { useCallback, memo, useEffect } from "react"
import classNames from "classnames"
import ReactPlayer from "react-player"
import { Button, LottieComponent } from "@/shared/ui"
import VideoAnimation from "@/../public/animations/PD_em6.json"
import type { IUserFile } from "@/entities/user/model/types"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useUser } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

export type FeedSlideType = "photo-basic" | "photo-badges" | "photo-description" | "video"

interface Props extends WithTranslation {
  media: IUserFile
  userName: string
  isVideoPlaying?: boolean
  isMuted?: boolean
  className?: string
}

const FeedSlideBase = ({
  media,
  userName,
  isVideoPlaying = false,
  isMuted,
  className,
  t,
}: Props) => {
  const { data: currentUser } = useUser()
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()

  useEffect(() => {
    if (media.type === "video" && !currentUser?.is_premium) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: { items: [{ promotion_id: "video", promotion_name: "video" }] },
      })
    }
  }, [media.type, currentUser?.is_premium, sendUserEvent])

  const handleNavigateToPremium = useCallback(() => {
    triggerImpact()
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "video", promotion_name: "video" }] },
    })
    void navigate("/premium?sourceFeature=video")
  }, [navigate, triggerImpact, sendUserEvent])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const renderMedia = () => {
    if (media.type === "image") {
      return (
        <img
          src={media.url}
          alt={`${userName} photo`}
          className='w-full h-full object-cover object-top select-none pointer-events-none'
          draggable={false}
          onContextMenu={handleContextMenu}
          style={{
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
          }}
        />
      )
    }

    if (media.type === "video") {
      return (
        <div className='w-full h-full relative bg-grey-10'>
          {!currentUser?.is_premium && (
            <div className='absolute z-10 inset-0 flex items-center justify-center flex-col px-3 text-center'>
              <LottieComponent animationData={VideoAnimation} width={80} height={80} />
              <h6 className='title1-bold mb-2 mt-6 text-center'>{t("video.title")}</h6>
              <p className='body-regular mb-4 text-center text-white-50'>
                {t("video.premiumOnly")}
              </p>
              <Button size='L' onClick={handleNavigateToPremium}>
                <span>{t("profile.buyPremium")}</span>
              </Button>
            </div>
          )}

          <div className={classNames("h-full", !currentUser?.is_premium && "blur-xl")}>
            <ReactPlayer
              src={media.url}
              playing={isVideoPlaying}
              loop={true}
              controls={false}
              volume={1}
              muted={isMuted}
              playsInline={true}
              width='100%'
              height='100%'
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={classNames("relative h-full overflow-hidden select-none", className)}>
      {renderMedia()}
    </div>
  )
}

const FeedSlideMemo = memo(FeedSlideBase, (prev, next) => {
  return (
    prev.media.id === next.media.id &&
    prev.isVideoPlaying === next.isVideoPlaying &&
    prev.isMuted === next.isMuted
  )
})

export const FeedSlide = withTranslation()(FeedSlideMemo)
