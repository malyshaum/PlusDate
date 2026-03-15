import { useLocation } from "react-router-dom"
import { NavTab } from "@/shared/ui"
import { NavLink } from "react-router-dom"

import CardInactiveIcon from "@/shared/assets/icons/footer/icon-nav-card.svg?react"
import CardActiveIcon from "@/shared/assets/icons/footer/icon-nav-active-card.svg?react"
import ProfileInactiveIcon from "@/shared/assets/icons/footer/icon-nav-profile.svg?react"
import ProfileActiveIcon from "@/shared/assets/icons/footer/icon-nav-active-profile.svg?react"
import HeartInactiveIcon from "@/shared/assets/icons/footer/icon-nav-heart.svg?react"
import HeartActiveIcon from "@/shared/assets/icons/footer/icon-nav-active-heart.svg?react"
import ChatInactiveIcon from "@/shared/assets/icons/footer/icon-nav-chat.svg?react"
import ChatActiveIcon from "@/shared/assets/icons/footer/icon-nav-active-chat.svg?react"

import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import classNames from "classnames"
import { useUser, useUserStats } from "@/entities/user/api/queries.ts"
import ProfileAnimationData from "@/../public/animations/pd_ic5profile.json"
import ChatsAnimationData from "@/../public/animations/pd_ic7chaty.json"
import LikesAnimation from "@/../public/animations/pd_ic6heart.json"
import SwipeAnimationData from "@/../public/animations/pd_ic4cards-2.json"
import { useScrollPositionRestore } from "@/shared/lib/useScrollPositionRestore"

const navigationItems = [
  {
    path: "/feed",
    inactiveIcon: <CardInactiveIcon className='w-8 h-8' />,
    activeIcon: <CardActiveIcon className='w-8 h-8' />,
    label: "menu.swipe",
    AnimationData: SwipeAnimationData,
  },
  {
    path: "/likes",
    inactiveIcon: <HeartInactiveIcon className='w-8 h-8' />,
    activeIcon: <HeartActiveIcon className='w-8 h-8' />,
    count: 0,
    label: "menu.likes",
    AnimationData: LikesAnimation,
  },
  {
    path: "/chats",
    inactiveIcon: <ChatInactiveIcon className='w-8 h-8' />,
    activeIcon: <ChatActiveIcon className='w-8 h-8' />,
    count: 0,
    showSubIndicator: false,
    label: "menu.chat",
    AnimationData: ChatsAnimationData,
  },
  {
    path: "/profile",
    inactiveIcon: <ProfileInactiveIcon className='w-8 h-8' />,
    activeIcon: <ProfileActiveIcon className='w-8 h-8' />,
    label: "menu.profile",
    AnimationData: ProfileAnimationData,
  },
]

export const PageFooter = () => {
  const { data: user } = useUser()
  const { data } = useUserStats(!!user?.feed_profile)
  const location = useLocation()
  const { triggerImpact } = useHapticFeedback()
  const { clearAllScrolls } = useScrollPositionRestore()

  const onNavLinkClick = () => {
    triggerImpact("light")
    clearAllScrolls()
  }

  navigationItems[1].count = data?.unresolved_likes || 0
  navigationItems[2].count = data?.unread_chats || 0
  navigationItems[2].showSubIndicator = data?.unread_chats === 0 && data?.unviewed_matches > 0

  return (
    <nav
      className='fixed w-[calc(100%-64px)] top-auto left-1/2 -translate-x-1/2 flex justify-center p-1 rounded-[40px] liquid-glass h-[64px] mx-auto overflow-hidden z-99'
      style={{ bottom: "var(--tg-viewport-safe-area-inset-bottom)" }}
    >
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavLinkClick}
          className={classNames("flex-1 flex justify-center items-center", {
            "bg-white-10 rounded-[60px]": location.pathname === item.path,
          })}
        >
          <NavTab
            AnimationData={item.AnimationData}
            inactiveIcon={item.inactiveIcon}
            activeIcon={item.activeIcon}
            label={item.label}
            count={item?.count}
            showSubIndicator={item?.showSubIndicator}
            isActive={location.pathname === item.path}
          />
        </NavLink>
      ))}
    </nav>
  )
}
