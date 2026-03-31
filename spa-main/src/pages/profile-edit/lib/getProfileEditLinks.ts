import type { TFunction } from "i18next"
import type { IUser } from "@/entities/user/model/types.ts"
import { getSearchForLabel, getCityName } from "@/shared/lib/userHelpers.ts"
import IconHeight from "@/shared/assets/icons/icon-height-white.svg"
import IconEye from "@/shared/assets/icons/icon-eye-white.svg"
import IconActivity from "@/shared/assets/icons/icon-activity-white.svg"
import IconLightining from "@/shared/assets/icons/icon-lightining.svg"

export interface ProfileEditLink {
  to: string
  label: string
  value: string
  img?: string
  className?: string
  showIndicator: boolean
}

export const getAdditionalInfoLinks = (
  user: IUser | undefined,
  t: TFunction,
): ProfileEditLink[] => {
  if (!user) return []

  return [
    {
      to: "/profile/edit/activity",
      label: t("profile.industry"),
      value: user.feed_profile?.activities?.[0]
        ? t(`activities.${user.feed_profile.activities[0].title}`)
        : t("profile.choose"),
      img: IconActivity,
      className: "mt-2",
      showIndicator: !user.feed_profile?.activities?.length,
    },
    {
      to: "/profile/edit/height",
      label: t("profile.height"),
      value: user.feed_profile?.height
        ? `${user.feed_profile.height} ${t("cm")}`
        : t("profile.choose"),
      img: IconHeight,
      className: "mt-2",
      showIndicator: !user.feed_profile?.height,
    },
    {
      to: "/profile/edit/eye",
      label: t("profile.eyeColor"),
      value: user.feed_profile?.eye_color
        ? t(`eyeColors.${user.feed_profile?.eye_color}`)
        : t("profile.choose"),
      img: IconEye,
      className: "mt-2",
      showIndicator: !user.feed_profile?.eye_color,
    },
    {
      to: "/profile/edit/interests",
      label: t("interests.title"),
      value: user.feed_profile?.hobbies?.length
        ? `${user.feed_profile.hobbies.length} / 5 ${t("profile.chosen")}`
        : t("profile.choose"),
      img: IconLightining,
      className: "mt-2",
      showIndicator: !user.feed_profile?.hobbies?.length,
    },
  ]
}

export const getMainInfoLinks = (
  user: IUser | undefined,
  t: TFunction,
  language: string,
): ProfileEditLink[] => {
  if (!user) return []

  return [
    {
      to: "/profile/edit/city",
      label: t("profile.yourCity"),
      value: getCityName(user.feed_profile?.city, language) || t("profile.choose"),
      className: "mt-2",
      showIndicator: !user.feed_profile?.city,
    },
    {
      to: "/profile/edit/search",
      label: t("interests.searchForQuestion"),
      value: user.feed_profile?.search_for
        ? getSearchForLabel(user.feed_profile.search_for, t)
        : t("profile.choose"),
      className: "mt-2",
      showIndicator: !user.feed_profile.search_for,
    },
  ]
}
