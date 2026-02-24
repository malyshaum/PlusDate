import React, { useCallback, useState, memo, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import classNames from "classnames"
import { useTranslation } from "react-i18next"
import { FeedSlide, type FeedSlideType } from "../FeedSlide"
import type { IUser, IUserFile } from "@/entities/user/model/types"
import { useLongPress } from "@uidotdev/usehooks"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { useSwipeFeedStore } from "@/features/SwipeCards"
import { useVideoSoundToggle } from "@/shared/lib/useVideoSoundToggle"
import { VideoSoundLayout } from "@/shared/ui/VideoSoundLayout/VideoSoundLayout"
import { UserInfo } from "@/entities/UserProfile/ui/UserInfo"
import { Button, Label, LottieComponent } from "@/shared/ui"
import { useDynamicBadgeCount } from "@/shared/lib/useDynamicBadgeCount"
import { useUser } from "@/entities/user/api/queries"
import { getCityName, getSearchForLabel } from "@/shared/lib/userHelpers"
import { ESex } from "@/shared/types/common"
import IconInstagram from "@/shared/assets/icons/icon-instagram-white.svg?react"
import IconMark from "@/shared/assets/icons/icon-mark-white.svg?react"
import IconHeight from "@/shared/assets/icons/icon-height-white.svg?react"
import IconEye from "@/shared/assets/icons/icon-eye-white.svg?react"
import IconMale from "@/shared/assets/icons/icon-male.svg?react"
import IconFemale from "@/shared/assets/icons/icon-female.svg?react"
import IconSearch from "@/shared/assets/icons/icon-search.svg?react"
import IconComplain from "@/shared/assets/icons/icon-complain.svg?react"
import type { i18n as Ti18n } from "i18next"
import InstAnimation from "@/../public/animations/pd_inst_lottie.json"

interface FeedCardProps {
  user: IUser
  onSlideChange?: (index: number) => void
  onPrevious?: () => void
  onNext?: () => void
  enablePagination?: boolean
  isOnCooldown?: boolean
  isTop?: boolean
  className?: string
}

const getSlides = (user: IUser) => {
  const photos = user.files
    .filter((file) => file.type === "image")
    .sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
  const videos = user.files.filter((file) => file.type === "video")
  const slideData: Array<{ type: FeedSlideType; media: IUserFile }> = []

  photos.forEach((photo) => {
    slideData.push({ type: "photo-basic", media: photo })
  })

  if (videos.length > 0) {
    slideData.push({ type: "video", media: videos[0] })
  }

  return slideData
}

const getBadges = (
  user: IUser,
  i18n: Ti18n,
  currentUser?: IUser,
  onInstagramClick?: () => void,
) => {
  const createBadge = (
    icon: React.ReactElement,
    value: string | null | undefined | React.ReactElement,
    options?: {
      className?: string
      disabled?: boolean
      shouldCapitalize?: boolean | "none"
      onClick?: () => void
    },
  ) => ({
    icon,
    value,
    className: options?.className,
    disabled: options?.disabled,
    shouldCapitalize: options?.shouldCapitalize,
    onClick: options?.onClick,
  })

  const instagramBadges = () => {
    if (!user.instagram) return []
    if (!currentUser?.is_premium) {
      return [
        createBadge(
          <IconInstagram />,
          <LottieComponent className='w-15 object-cover' animationData={InstAnimation} autoplay />,
          { disabled: true, onClick: onInstagramClick },
        ),
      ]
    }
    return [
      createBadge(<IconInstagram />, user.instagram, {
        shouldCapitalize: false,
        onClick: () => {
          window.open(`https://instagram.com/${user.instagram}`, "_blank")
        },
      }),
    ]
  }

  const sexIcon =
    user.feed_profile?.sex === ESex.female ? (
      <IconFemale height={16} width={16} />
    ) : (
      <IconMale height={16} width={16} />
    )
  const sexValue = user.feed_profile?.sex === ESex.female ? i18n.t("female") : i18n.t("male")

  return [
    ...instagramBadges(),
    createBadge(<IconMark />, getCityName(user.feed_profile?.city, i18n.language), {
      shouldCapitalize: "none",
    }),
    createBadge(<IconSearch />, getSearchForLabel(user.feed_profile.search_for, i18n.t)),
    createBadge(
      <img
        src={`/activities/${user.feed_profile?.activity?.title}.svg`}
        alt=''
        height={16}
        width={16}
      />,
      user.feed_profile?.activity?.title
        ? i18n.t(`activities.${user.feed_profile?.activity?.title}`)
        : null,
    ),
    createBadge(
      <IconHeight />,
      user.feed_profile?.height ? `${user.feed_profile.height} ${i18n.t("cm")}` : null,
    ),
    createBadge(
      <IconEye />,
      user.feed_profile?.eye_color ? i18n.t(`eyeColors.${user.feed_profile?.eye_color}`) : null,
    ),
    createBadge(sexIcon, sexValue),
    ...(user.feed_profile?.hobbies?.map((h) =>
      createBadge(<span className='leading-[16px]'>{h.emoji}</span>, i18n.t(`hobbies.${h.title}`)),
    ) || []),
  ].filter((item) => item.value)
}

const FeedCardComponent = ({
  user,
  onSlideChange,
  onPrevious,
  onNext,
  enablePagination = true,
  isOnCooldown = false,
  isTop = false,
  className,
}: FeedCardProps) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const { i18n, t } = useTranslation()
  const { data: currentUser } = useUser()
  const setCardPressed = useSwipeFeedStore((state) => state.setCardPressed)
  const isCardPressed = useSwipeFeedStore(
    (state) => state.pressedCardId === user.feed_profile.id && !state.isDragging,
  )
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isTop) {
      setCurrentSlide(0)
      setIsExpanded(false)
    }
  }, [isTop])
  const { isMuted, toggleAudioThrottled, showAudioIcon, accountUser } = useVideoSoundToggle()

  const slides = useMemo(() => getSlides(user), [user])

  const navigateToPremium = useCallback(() => {
    void navigate("/premium?sourceFeature=instagram")
  }, [navigate])

  const badges = useMemo(
    () => getBadges(user, i18n, currentUser, navigateToPremium),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, i18n.language, currentUser?.is_premium, navigateToPremium],
  )
  const { containerRef, maxVisibleBadges } = useDynamicBadgeCount(badges.length, isExpanded)

  const longPressAttrs = useLongPress(
    () => {
      setCardPressed(user.feed_profile.id)
      triggerImpact()
    },
    {
      threshold: 400,
      onStart: (event) => event.preventDefault(),
      onFinish: () => setCardPressed(null),
      onCancel: () => setCardPressed(null),
    },
  )

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const toggleExpandedInfo = useCallback(() => {
    triggerImpact()
    setIsExpanded((prevState) => !prevState)
  }, [triggerImpact])

  const scrollPrev = useCallback(() => {
    setCurrentSlide((prev) => {
      const newIndex = Math.max(0, prev - 1)
      if (newIndex !== prev) {
        triggerImpact()
        onSlideChange?.(newIndex)
        onPrevious?.()
      }
      return newIndex
    })
  }, [triggerImpact, onSlideChange, onPrevious])

  const scrollNext = useCallback(() => {
    setCurrentSlide((prev) => {
      const newIndex = Math.min(slides.length - 1, prev + 1)
      if (newIndex !== prev) {
        triggerImpact()
        onSlideChange?.(newIndex)
        onNext?.()
      }
      return newIndex
    })
  }, [slides.length, triggerImpact, onSlideChange, onNext])

  const currentSlideData = slides[currentSlide]
  const isCurrentVideo = currentSlideData?.type === "video"

  const handleRightZoneClick = useCallback(() => {
    if (isCurrentVideo) {
      toggleAudioThrottled()
    } else {
      scrollNext()
    }
  }, [isCurrentVideo, toggleAudioThrottled, scrollNext])

  const handleMuteToggle = useCallback(() => {
    if (isCurrentVideo) toggleAudioThrottled()
  }, [isCurrentVideo, toggleAudioThrottled])

  const visibleBadges = useMemo(
    () => (isExpanded ? badges : badges.slice(0, maxVisibleBadges)),
    [isExpanded, badges, maxVisibleBadges],
  )
  const remainingCount = badges.length - visibleBadges.length

  const navigateToReport = useCallback(async () => {
    await navigate("/profile/report", { state: { userId: user.id, source: "swipe_feed" } })
  }, [navigate, user.id])

  const handleBadgeClick =
    (onClick?: () => void) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onClick) {
        e.stopPropagation()
        onClick()
      }
    }

  return (
    <div
      className={classNames("relative h-full w-full bg-grey-10 overflow-hidden", className)}
      onContextMenu={handleContextMenu}
      {...longPressAttrs}
    >
      <div
        className='flex h-full transition-transform duration-300 ease-out will-change-transform'
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.media.id} className='w-full h-full flex-shrink-0'>
            <FeedSlide
              media={slide.media}
              userName={user.name}
              isVideoPlaying={index === currentSlide && slide.type === "video"}
              isMuted={slide.type === "video" && accountUser?.is_premium ? isMuted : true}
              className='bg-grey-10'
            />
          </div>
        ))}
      </div>

      {isOnCooldown && (
        <div className='absolute inset-0 bg-black/40 z-2 pointer-events-none' />
      )}

      {!isOnCooldown && (
        <>
          <div
            className='absolute w-[25%] top-14 left-0 bottom-20 bg-transparent z-10 cursor-pointer'
            onClick={scrollPrev}
          />
          <div
            className='absolute w-[25%] top-14 right-0 bottom-20 bg-transparent z-10 cursor-pointer'
            onClick={handleRightZoneClick}
          />

          {accountUser?.is_premium && (
            <VideoSoundLayout
              isIconVisible={!!showAudioIcon && isCurrentVideo}
              toggleStatus={showAudioIcon}
              handleMuteToggle={handleMuteToggle}
            />
          )}

          {enablePagination && slides.length > 1 && (
            <div className='absolute top-6 left-0 right-0 flex justify-center items-center gap-1 z-20'>
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={classNames(
                    "w-2 h-2 rounded-full transition-colors flex items-center justify-center",
                    index === currentSlide ? "bg-white" : "bg-white/20",
                  )}
                >
                  {slide.type === "video" && (
                    <svg viewBox='0 0 8 8' className='w-[6px] h-[6px]'>
                      <polygon points='2,1 7,4 2,7' fill={index === currentSlide ? "black" : "white"} />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isCurrentVideo && (
            <>
              <div
                className={classNames(
                  "absolute left-0 right-0 bottom-[68px] px-4 z-20 transition-opacity duration-200",
                  isCardPressed ? "opacity-0" : "opacity-100",
                )}
                onClick={toggleExpandedInfo}
              >
                <UserInfo name={user.name} age={user.feed_profile?.age} is_premium={user.is_premium} />
                <div className='mt-2'>
                  <div
                    ref={containerRef}
                    className={classNames(
                      "flex gap-1 items-center",
                      isExpanded ? "flex-wrap" : "flex-nowrap overflow-hidden",
                    )}
                  >
                    {visibleBadges.map((item, index) => (
                      <div
                        key={index}
                        data-label
                        className={classNames(isExpanded ? "" : "flex-shrink min-w-0")}
                        onClick={handleBadgeClick(item.onClick)}
                      >
                        <Label
                          icon={item.icon}
                          value={item.value}
                          className={item?.className}
                          shouldCapitalize={item.shouldCapitalize}
                        />
                      </div>
                    ))}
                    {remainingCount > 0 && !isExpanded && (
                      <div className='flex-shrink-0'>
                        <Label value={`+${remainingCount}`} />
                      </div>
                    )}
                  </div>
                  {user?.profile_description && (
                    <p
                      className={classNames(
                        "body-regular mt-2 cursor-pointer !leading-[24px]",
                        !isExpanded && "line-clamp-1",
                      )}
                    >
                      {user.profile_description}
                    </p>
                  )}
                  {isExpanded && (
                    <Button appearance='icon+text' size='O' className='mt-2' onClick={navigateToReport}>
                      <>
                        <IconComplain />
                        <span className='caption1-medium text-white-70 !capitalize'>{t("report")}</span>
                      </>
                    </Button>
                  )}
                </div>
              </div>

              <div className='bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4527)_40.48%,rgba(0,0,0,0.6)_100%)] absolute bottom-0 left-0 right-0 w-full z-2 pointer-events-none h-[50%]' />
            </>
          )}
        </>
      )}
    </div>
  )
}

export const FeedCard = memo(FeedCardComponent, (prev, next) => {
  return (
    prev.user === next.user &&
    prev.isOnCooldown === next.isOnCooldown &&
    prev.isTop === next.isTop
  )
})
