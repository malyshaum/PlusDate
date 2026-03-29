import { PageLayout, useModal, Modal, InviteFriendsModal } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { ButtonLink, Notification, Skeleton } from "@/shared/ui"

import IconCrownWhite from "@/shared/assets/icons/icon-crown-white.svg?react"
import PencilIcon from "@/shared/assets/icons/icon-pencil.svg?react"
import SettingsIcon from "@/shared/assets/icons/icon-settings.svg?react"
import IconHeart from "@/shared/assets/icons/icon-heart.svg?react"
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react"
import TriangleWarningIcon from "@/shared/assets/icons/icon-triangle-warning.svg?react"
import RoundedWarningIcon from "@/shared/assets/icons/icon-rounded-warning.svg?react"
import { UserProfile } from "@/entities/UserProfile/ui/UserProfile.tsx"
import { useExternalUser, useUser } from "@/entities/user/api/queries.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import useProfileFullness from "@/entities/user/lib/useProfileFullness.tsx"
import { useEffect, useMemo } from "react"
import type { IUser } from "@/entities/user/model/types.ts"
import {
  PROFILE_EDIT_SCROLL_KEY,
  useScrollPositionRestore,
} from "@/shared/lib/useScrollPositionRestore"

export const ProfilePageBase = ({ t }: WithTranslation) => {
  const { data: user } = useUser()
  const sendUserEvent = useUserGTMEvent()
  const { data: meUser } = useExternalUser(user?.id)
  const isUserProfileFull = useProfileFullness(user)
  const { clearScroll } = useScrollPositionRestore(PROFILE_EDIT_SCROLL_KEY)
  const { isOpen, open, close } = useModal()

  const links = [
    {
      icon: <PencilIcon />,
      path: "/profile/edit",
      labelKey: "myProfile.editProfile",
      showIndicator: !isUserProfileFull,
      disabled: user?.is_under_moderation,
    },
    ...(user?.is_premium
      ? [
          {
            icon: <IconCrownWhite />,
            path: "/premium",
            labelKey: "myProfile.subscription",
          },
        ]
      : [
          {
            icon: <IconHeart />,
            path: "",
            labelKey: "myProfile.inviteFriends",
            onClick: () => open(),
          },
        ]),
    {
      icon: <SettingsIcon />,
      path: "/profile/settings",
      labelKey: "myProfile.settings",
    },
  ]

  const transformedUser = useMemo(() => {
    if (!user?.settings?.hide_age) return user

    return {
      ...user,
      feed_profile: {
        ...user.feed_profile,
        age: null,
      },
    }
  }, [user])

  const transformedMeUser = useMemo(() => {
    if (!meUser?.settings?.hide_age) return meUser

    return {
      ...meUser,
      feed_profile: {
        ...meUser.feed_profile,
        age: null,
      },
    }
  }, [meUser])

  const showPremiumButton = !user?.is_premium

  useEffect(() => {
    clearScroll()
  }, [clearScroll])

  useEffect(() => {
    if (!user?.is_premium) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: { items: [{ promotion_id: "profile", promotion_name: "profile" }] },
      })
    }
  }, [user?.is_premium, sendUserEvent])

  return (
    <PageLayout
      shadow={{ bottom: true, top: false }}
      className='!pt-0 pb-safe-area-bottom-with-menu'
    >
      {!isUserProfileFull && !user?.is_under_moderation && (
        <Notification
          icon={<RoundedWarningIcon />}
          title='profile.finishProfile'
          subtitle='profile.finishProfileSubtitle'
          type='warning'
        />
      )}

      {user?.is_under_moderation && (
        <Notification
          icon={<TriangleWarningIcon />}
          title='profile.underModeration'
          subtitle='profile.underModerationSubtitle'
          type='error'
        />
      )}

      {user && user?.is_under_moderation && (
        <UserProfile
          previewMode={true}
          user={transformedUser as IUser}
          guestMode={true}
          guestPreview={false}
        />
      )}
      {meUser && !user?.is_under_moderation && (
        <UserProfile
          previewMode={true}
          user={transformedMeUser as IUser}
          guestMode={true}
          guestPreview={false}
        />
      )}
      {!(user && user?.is_under_moderation) && !(meUser && !user?.is_under_moderation) && (
        <div className='h-90 rounded-[24px] overflow-hidden'>
          <Skeleton className='w-full h-full rounded-[24px]' />
        </div>
      )}
      {showPremiumButton ? (
        <div
          onClick={() => {
            sendUserEvent({
              event: "select_promotion",
              ecommerce: { items: [{ promotion_id: "profile", promotion_name: "profile" }] },
            })
          }}
        >
          <ButtonLink
            to='/premium'
            variant='accent'
            icon={<IconCrownWhite />}
            rightElement={<ChevronIcon />}
            className='mt-4'
          >
            <span className='block body-bold'>{t("profile.buyPremium")}</span>
            <span className='block subtitle-medium mt-1 !normal-case'>
              {t("profile.premiumDiscount")}
            </span>
          </ButtonLink>
        </div>
      ) : (
        <ButtonLink
          to=''
          onClick={open}
          variant='accent'
          icon={<IconHeart />}
          rightElement={<ChevronIcon />}
          className='mt-4'
        >
          <span className='block body-bold'>{t("myProfile.inviteFriends")}</span>
        </ButtonLink>
      )}

      <ul className='mt-[10px]'>
        {links.map((link) => (
          <li
            key={link.path}
            className='mb-1'
            onClick={() =>
              link.path === "/premium" &&
              sendUserEvent({
                event: "select_promotion",
                ecommerce: { items: [{ promotion_id: "profile", promotion_name: "profile" }] },
              })
            }
          >
            <ButtonLink
              to={link.path}
              icon={link.icon}
              rightElement={<ChevronIcon />}
              showIndicator={link?.showIndicator}
              disabled={link?.disabled}
              onClick={link?.onClick}
            >
              {t(link.labelKey)}
            </ButtonLink>
          </li>
        ))}
      </ul>
      <Modal isOpen={isOpen} onClose={close}>
        <InviteFriendsModal onClose={close} />
      </Modal>
    </PageLayout>
  )
}

export const ProfilePage = withTranslation()(ProfilePageBase)
