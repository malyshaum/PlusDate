import { useMemo } from "react"
import classNames from "classnames"
import { Label, LottieComponent } from "@/shared/ui"
import IconInstagram from "@/shared/assets/icons/icon-instagram-white.svg?react"
import IconMark from "@/shared/assets/icons/icon-mark-white.svg?react"
import IconHeight from "@/shared/assets/icons/icon-height-white.svg?react"
import IconEye from "@/shared/assets/icons/icon-eye-white.svg?react"
import IconMale from "@/shared/assets/icons/icon-male.svg?react"
import IconFemale from "@/shared/assets/icons/icon-female.svg?react"
import IconSearch from "@/shared/assets/icons/icon-search.svg?react"
import { ESex } from "@/shared/types/common.ts"
import type { IUser } from "@/entities/user/model/types.ts"
import { getCityName, getSearchForLabel } from "@/shared/lib/userHelpers.ts"
import { useTranslation } from "react-i18next"
import { useUser } from "@/entities/user/api/queries.ts"
import { useDynamicBadgeCount } from "@/shared/lib/useDynamicBadgeCount.ts"
import InstAnimation from "@/../public/animations/pd_inst_lottie.json"
import { useNavigate } from "react-router-dom"

interface UserDetailsProps {
  user: IUser
  className?: string
  isExpanded?: boolean
  onExpand?: (e: React.MouseEvent) => void
}

export const UserDetails = ({
  user,
  className,
  isExpanded = false,
  onExpand,
}: UserDetailsProps) => {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const { data: currentUser } = useUser()

  const badges = useMemo(() => {
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
      const isOwnProfile = currentUser?.id === user.id
      const shouldShowInstagram = isOwnProfile || currentUser?.is_premium

      if (!shouldShowInstagram) {
        return [
          createBadge(
            <IconInstagram />,
            <LottieComponent
              className='w-15 object-cover'
              animationData={InstAnimation}
              autoplay
            />,
            {
              disabled: true,
              onClick: () => {
                void navigate("/premium?sourceFeature=instagram")
              },
            },
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
    const sexValue = user.feed_profile?.sex === ESex.female ? t("female") : t("male")

    return [
      ...instagramBadges(),
      createBadge(<IconMark />, getCityName(user.feed_profile?.city, i18n.language), {
        shouldCapitalize: "none",
      }),
      createBadge(<IconSearch />, getSearchForLabel(user.feed_profile.search_for, t)),
      createBadge(
        <img
          src={`/activities/${user.feed_profile?.activity?.title}.svg`}
          alt=''
          height={16}
          width={16}
        />,
        user.feed_profile?.activity?.title
          ? t(`activities.${user.feed_profile?.activity?.title}`)
          : null,
      ),
      createBadge(
        <IconHeight />,
        user.feed_profile?.height ? `${user.feed_profile.height} ${t("cm")}` : null,
      ),
      createBadge(
        <IconEye />,
        user.feed_profile?.eye_color ? t(`eyeColors.${user.feed_profile?.eye_color}`) : null,
      ),
      createBadge(sexIcon, sexValue),
      ...(user.feed_profile?.hobbies?.map((h) =>
        createBadge(<span className='leading-[16px]'>{h.emoji}</span>, t(`hobbies.${h.title}`)),
      ) || []),
    ].filter((item) => item.value)
  }, [
    user.instagram,
    user.feed_profile?.city,
    user.feed_profile.search_for,
    user.feed_profile?.activity?.title,
    user.feed_profile?.height,
    user.feed_profile?.eye_color,
    user.feed_profile.sex,
    user.feed_profile?.hobbies,
    user.id,
    i18n,
    t,
    currentUser?.is_premium,
    currentUser?.id,
    navigate,
  ])

  const { containerRef, maxVisibleBadges } = useDynamicBadgeCount(badges.length, isExpanded)

  const visibleBadges = isExpanded ? badges : badges.slice(0, maxVisibleBadges)
  const remainingCount = badges.length - visibleBadges.length

  const handleBadgeClick =
    (onClick?: () => void) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onClick) {
        e.stopPropagation()
        onClick()
      }
    }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={classNames(
          "mt-2 flex gap-1 items-center",
          isExpanded ? "flex-wrap" : "flex-nowrap overflow-hidden",
        )}
        onClick={onExpand}
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
          onClick={onExpand}
        >
          {user.profile_description}
        </p>
      )}
    </div>
  )
}
