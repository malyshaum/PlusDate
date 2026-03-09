import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import classNames from "classnames"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import ReactPlayer from "react-player"
import styles from "./index.module.css"
import type { IUserFile } from "@/entities/user/model/types.ts"
import { useTranslation, withTranslation, type WithTranslation } from "react-i18next"
import { renderVideoBullet } from "@/shared/lib/renderVideoBullet.ts"
import { Button, LottieComponent } from "@/shared/ui"
import VideoAnimation from "../../../../public/animations/PD_em6.json"
import { useUser } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useVideoSoundToggle } from "@/shared/lib/useVideoSoundToggle"
import { VideoSoundLayout } from "@/shared/ui/VideoSoundLayout/VideoSoundLayout"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

interface Props extends WithTranslation {
  items: IUserFile[]
  userName: string
  onSlideChange?: (index: number) => void
  onPrevious?: () => void
  onNext?: () => void
  enablePagination?: boolean
  slidesPerView?: number
  spaceBetween?: number
  className?: string
  itemClassName?: string
  enableSidesNavigation?: boolean
  guestPreview?: boolean
  onVideoOverlayChange?: (isShowing: boolean) => void
}

const MediaCarouselBase = ({
  items,
  userName,
  onSlideChange,
  onPrevious,
  onNext,
  enablePagination = true,
  slidesPerView = 1,
  spaceBetween = 0,
  className,
  itemClassName,
  enableSidesNavigation,
  guestPreview,
  onVideoOverlayChange,
}: Props) => {
  const { data: currentUser } = useUser()
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()
  const { t } = useTranslation()
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const { isMuted, toggleAudioThrottled, showAudioIcon } = useVideoSoundToggle()

  const photos = items
    .filter((file) => file.type === "image")
    .sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
  const videos = items.filter((file) => file.type === "video")

  const allMedia = useMemo(() => {
    return [...photos, ...videos]
  }, [photos, videos])
  const currentItem = allMedia[currentSlide]
  const isCurrentSlideVideo = currentItem?.type === "video"
  const isVideoOverlayShowing = Boolean(
    !currentUser?.is_premium && guestPreview && isCurrentSlideVideo,
  )

  useEffect(() => {
    onVideoOverlayChange?.(isVideoOverlayShowing)
  }, [isVideoOverlayShowing, onVideoOverlayChange])

  const scrollPrev = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
    onPrevious?.()
  }, [onPrevious])

  const scrollNext = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
    onNext?.()
  }, [onNext])

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.activeIndex
      setCurrentSlide(newIndex)
      triggerImpact()
      onSlideChange?.(newIndex)
    },
    [onSlideChange, triggerImpact],
  )

  const renderBullet = useCallback(
    (index: number, className: string) => {
      const isVideo = allMedia[index]?.type === "video"
      return renderVideoBullet(className, isVideo)
    },
    [allMedia],
  )

  const handleNavigateToPremium = useCallback(() => {
    triggerImpact()
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "video", promotion_name: "video" }] },
    })
    void navigate("/premium?sourceFeature=video")
  }, [navigate, triggerImpact, sendUserEvent])

  useEffect(() => {
    if (videos.length > 0 && !currentUser?.is_premium && guestPreview) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: { items: [{ promotion_id: "video", promotion_name: "video" }] },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={classNames("overflow-hidden h-full", className)}>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        pagination={{
          clickable: true,
          enabled: enablePagination,
          renderBullet,
        }}
        allowTouchMove={true}
        className={classNames("w-full h-full", styles["custom-swiper"])}
      >
        {allMedia.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className={classNames(
                "relative h-full overflow-hidden bg-grey-10 border border-white-10 rounded-[24px]",
                itemClassName,
              )}
            >
              {item.type === "image" && (
                <img
                  src={item.url}
                  alt={`${userName} photo ${index + 1}`}
                  className='w-full h-full object-cover object-center select-none pointer-events-none'
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                  }}
                />
              )}

              {item.type === "video" && (
                <div className='w-full h-full relative' ref={videoContainerRef}>
                  <ReactPlayer
                    src={item.url}
                    playing={isCurrentSlideVideo}
                    loop={true}
                    controls={false}
                    volume={1}
                    muted={
                      (guestPreview && currentUser?.is_premium) || !guestPreview ? isMuted : true
                    }
                    width='100%'
                    height='100%'
                  />
                  {!currentUser?.is_premium && guestPreview && (
                    <div className='absolute z-10 inset-0 flex items-center justify-center flex-col px-3 text-center backdrop-blur-[40px]'>
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
                </div>
              )}

              {enableSidesNavigation && (
                <>
                  <div
                    className='absolute h-full w-[25%] top-0 left-0 bottom-0 bg-transparent z-10 cursor-pointer'
                    onClick={scrollPrev}
                  />
                  <div
                    className='absolute h-full w-[25%] top-0 right-0 bottom-0 bg-transparent z-10 cursor-pointer'
                    onClick={() => {
                      const isCurrentVideo = allMedia[currentSlide]?.type === "video"
                      if (isCurrentVideo) {
                        toggleAudioThrottled()
                      } else {
                        scrollNext()
                      }
                    }}
                  />
                </>
              )}
              {(currentUser?.is_premium ? true : !guestPreview || currentUser?.is_premium) && (
                <VideoSoundLayout
                  isIconVisible={
                    !!showAudioIcon &&
                    index === currentSlide &&
                    allMedia[currentSlide]?.type === "video"
                  }
                  toggleStatus={showAudioIcon}
                  handleMuteToggle={() => {
                    const isCurrentVideo = allMedia[currentSlide]?.type === "video"
                    if (isCurrentVideo) toggleAudioThrottled()
                  }}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
export const MediaCarousel = withTranslation()(MediaCarouselBase)
