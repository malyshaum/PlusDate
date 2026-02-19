import type { IUser } from "@/entities/user/model/types.ts"
import { UserAvatar } from "@/shared/ui"
import classNames from "classnames"
import { memo } from "react"
import { type WithTranslation, withTranslation } from "react-i18next"

interface Props extends WithTranslation {
  user?: IUser
  userId?: number
  user_name?: string
  url?: string
  onClick?: () => void
  blurred?: boolean
  className?: string
  children?: React.ReactNode
  isViewed?: boolean
}

export const MatchCardBase = ({
  user,
  userId,
  onClick,
  blurred,
  className,
  t,
  children,
  url,
  user_name,
  isViewed = false,
}: Props) => {
  const imageUrl = url || user?.files?.find((f) => f.is_main && f.type === "image")?.url || ""
  const name = user_name || user?.name
  const resolvedUserId = userId ?? user?.id

  return (
    <div
      className='relative flex flex-col items-center cursor-pointer flex-shrink-0'
      onClick={onClick}
    >
      <UserAvatar
        src={imageUrl}
        alt={name}
        size='lg'
        userId={resolvedUserId}
        blurred={blurred}
        className={className}
      >
        {children}
      </UserAvatar>
      <div className='mt-1 text-center w-16'>
        <span
          className={classNames("subtitle-medium text-white-70 truncate block !capitalize", {
            "!font-extrabold text-white-100": !isViewed,
          })}
        >
          {blurred ? t("likes.title") : name}
        </span>
      </div>
    </div>
  )
}

export const MatchCard = memo(withTranslation()(MatchCardBase))
