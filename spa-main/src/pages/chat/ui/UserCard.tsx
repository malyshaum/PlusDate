import { useNavigate } from "react-router-dom"
import classNames from "classnames"
import { UserAvatar } from "@/shared/ui"
import type { IUser } from "@/entities/user/model/types"

interface UserCardProps {
  user?: IUser
  isOtherUserOnline?: boolean
}

export const UserCard = ({ user, isOtherUserOnline }: UserCardProps) => {
  const navigate = useNavigate()
  const photo = user?.files?.find((file) => file.type === "image" && file.is_main)?.url || ""

  const onClick = () => {
    void navigate(`/user/${user?.id}?showRemoveMatch=true`, {
      state: { reportSource: "chat_profile" },
    })
  }

  if (!user) return null

  return (
    <button
      className={classNames(
        "fixed w-fit max-w-[70%] top-4 left-1/2 -translate-x-1/2 z-50",
        "rounded-[24px] p-1 pr-3 flex items-center gap-2",
        "liquid-glass overflow-hidden",
      )}
      onClick={onClick}
    >
      <UserAvatar
        src={photo}
        alt={user.name}
        size='md'
        userId={user.id}
        isOnlineOverride={isOtherUserOnline}
      />
      <span className='body-bold flex-1 truncate z-20'>{user.name}</span>
    </button>
  )
}
