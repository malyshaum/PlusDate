import type { IChat } from "@/entities/chats/model/types"
import { formatTimeAgo } from "@/shared/lib/date"
import { UserAvatar } from "@/shared/ui"
import classNames from "classnames"
import { memo } from "react"
import { useNavigate } from "react-router-dom"
import { withTranslation, type WithTranslation } from "react-i18next"

interface Props extends WithTranslation {
  chat: IChat
  onClick?: () => void
  currentUserId: number
}

export const ChatCardBase = ({ chat, onClick, currentUserId, t }: Props) => {
  const { users, latest_message } = chat
  const otherUser = users.find((user) => user.id !== currentUserId)
  const imageUrl = otherUser?.files?.find((f) => f.is_main && f.type === "image")?.url || ""
  const navigate = useNavigate()

  const isMyMessage = latest_message?.sender_id === currentUserId
  const isRead = latest_message?.read_at !== null
  const shouldShowMuted = isMyMessage || isRead

  const timeAgo = latest_message
    ? formatTimeAgo(latest_message.created_at)
    : formatTimeAgo(chat.created_at)

  const handleNavigate = () => {
    void navigate(`/chat/${chat.id}?userId=${otherUser?.id}`)
  }

  return (
    <div>
      <div className='flex items-start gap-2 cursor-pointer' onClick={onClick}>
        <UserAvatar src={imageUrl} alt={otherUser?.name} size='lg' userId={otherUser?.id} />

        <div className='flex-1 min-w-0' onClick={handleNavigate}>
          <div className='h-[64px] mb-3 flex flex-col justify-center gap-1'>
            <div className='flex justify-between items-center'>
              <span className='body-bold'>{otherUser?.name}</span>
              <span
                className={classNames("caption1-medium", {
                  "text-white-50": shouldShowMuted,
                  "text-white": !shouldShowMuted,
                })}
              >
                {timeAgo}
              </span>
            </div>
            <div className='flex justify-between items-start gap-1'>
              <div className='flex-1 min-w-0 '>
                {latest_message ? (
                  <p
                    className={classNames("body-regular line-clamp-2 !leading-[140%]", {
                      "text-white-50": shouldShowMuted,
                      "text-white": !shouldShowMuted,
                    })}
                  >
                    {latest_message.message}
                  </p>
                ) : (
                  <p className='body-regular line-clamp-2 text-white-50 !leading-[140%]'>
                    {t("chats.newMatch")}
                  </p>
                )}
              </div>
              {chat.unread_count > 0 && !shouldShowMuted && (
                <div className='flex items-center justify-center px-[6px] h-5 button-main bg-attention rounded-[44px]'>
                  {chat.unread_count}
                </div>
              )}
            </div>
          </div>
          <div className='h-[1px] bg-white-10'></div>
        </div>
      </div>
    </div>
  )
}

export const ChatCard = memo(withTranslation()(ChatCardBase))
