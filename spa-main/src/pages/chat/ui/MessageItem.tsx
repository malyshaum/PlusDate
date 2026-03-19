import { memo } from "react"
import classNames from "classnames"
import type { IMessage } from "@/entities/chats/model/types"
import IconSent from "@/shared/assets/icons/icon-unread.svg"
import IconRead from "@/shared/assets/icons/icon-read.svg"
import { useInView } from "react-intersection-observer"
import { formatDate } from "@/shared/lib/date"

interface Props {
  message: IMessage
  isOwnMessage: boolean
  onMessageVisible?: (messageId: number) => void
}

export const MessageItemBase = ({ message, isOwnMessage, onMessageVisible }: Props) => {
  const enableTracking = !isOwnMessage && !message.read_at

  const { ref } = useInView({
    threshold: 0.5,
    rootMargin: "0px 0px -50px 0px",
    skip: !enableTracking,
    triggerOnce: true,
    onChange: (inView) => {
      if (inView) {
        onMessageVisible?.(message.id)
      }
    },
  })

  return (
    <div
      ref={ref}
      data-message-id={message.id}
      className={classNames("flex", {
        "justify-end": isOwnMessage,
        "justify-start": !isOwnMessage,
      })}
    >
      <div
        className={classNames("max-w-[80%] w-fit rounded-2xl p-3", {
          "bg-accent rounded-br-[4px]": isOwnMessage,
          "bg-white-10 rounded-bl-[4px]": !isOwnMessage,
        })}
      >
        <div className='body-regular wrap-break-word !leading-[120%] !select-text'>
          {message.message}
        </div>

        <div className='flex items-center justify-end gap-1'>
          <span
            className={classNames("small-medium", {
              "text-white-50": isOwnMessage,
              "text-grey-50": !isOwnMessage,
            })}
          >
            {formatDate(message.sent_at, "HH:mm")}
          </span>
          {isOwnMessage && (
            <div>
              {message.read_at ? <img src={IconRead} alt='' /> : <img src={IconSent} alt='' />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const MessageItem = memo(MessageItemBase)
