import classNames from "classnames"
import { memo } from "react"
import { useIsUserOnline } from "@/entities/user/api/queries"
import { usePresenceOverride } from "./PresenceOverrideContext"

type AvatarSize = "sm" | "md" | "lg"

interface UserAvatarProps {
  src: string
  alt?: string
  name?: string
  size?: AvatarSize
  userId?: number
  isOnlineOverride?: boolean
  showName?: boolean
  blurred?: boolean
  className?: string
  imageClassName?: string
  onClick?: () => void
  children?: React.ReactNode
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16.5 h-16.5",
}

const onlineIndicatorClasses: Record<AvatarSize, string> = {
  sm: "w-2.5 h-2.5 bottom-0 right-0 border",
  md: "w-3 h-3 bottom-0.5 right-0.5 border-2",
  lg: "w-3.5 h-3.5 bottom-1 right-1 border-2",
}

export const UserAvatar = memo(
  ({
    src,
    alt,
    name,
    size = "md",
    userId,
    isOnlineOverride,
    showName = false,
    blurred = false,
    className,
    imageClassName,
    onClick,
    children,
  }: UserAvatarProps) => {
    const isOnlineFromContext = usePresenceOverride(userId)
    const isOnlineFromPolling = useIsUserOnline(userId)
    const isOnline =
      isOnlineOverride !== undefined
        ? isOnlineOverride
        : isOnlineFromContext !== undefined
          ? isOnlineFromContext
          : isOnlineFromPolling

    return (
      <div
        className={classNames(
          "relative flex flex-col items-center flex-shrink-0",
          { "cursor-pointer": onClick },
          className,
        )}
        onClick={onClick}
      >
        <div className={classNames("relative rounded-full overflow-hidden", sizeClasses[size])}>
          <img
            src={src}
            alt={alt || name || "User avatar"}
            className={classNames(
              "w-full h-full object-cover object-center",
              { "blur-sm scale-[1]": blurred },
              imageClassName,
            )}
          />
          {children}
        </div>
        {isOnline && (
          <div
            className={classNames(
              "absolute bg-[#69EB42] rounded-full border-grey-10",
              onlineIndicatorClasses[size],
            )}
          />
        )}
        {showName && name && (
          <div className='mt-1 text-center w-16'>
            <span className='subtitle-medium text-white truncate block !capitalize'>{name}</span>
          </div>
        )}
      </div>
    )
  },
)

UserAvatar.displayName = "UserAvatar"
