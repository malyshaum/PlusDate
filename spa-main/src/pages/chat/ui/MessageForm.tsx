import { TextareaField } from "@/shared/ui"
import IconArrow from "@/shared/assets/icons/icon-arrow-up.svg"
import { type ChatMessageForm, useChatForm } from "@/pages/chat/lib"
import { type IMessage, useSendMessage } from "@/entities/chats"
import { motion, AnimatePresence } from "framer-motion"
import classNames from "classnames"
import type { Ref } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  chatId?: string
  onSuccess: (message: IMessage) => void
  onInputFocus?: () => void
  onInputBlur?: () => void
  onTyping?: () => void
  formRef?: Ref<HTMLFormElement>
  className?: string
  placeholder?: string
  isTyping?: boolean
  typingUserName?: string
}

export const MessageForm = ({
  chatId,
  onSuccess,
  onInputFocus,
  onInputBlur,
  onTyping,
  className,
  formRef,
  placeholder = "Type a message...",
  isTyping,
  typingUserName,
}: Props) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
    messageText,
  } = useChatForm()

  const sendMessageMutation = useSendMessage({
    onSuccess,
  })

  const handleSendMessage = (data: ChatMessageForm) => {
    if (data.content.trim() && chatId) {
      const messageToSend = data.content
      setValue("content", "")
      sendMessageMutation.mutate({
        chat_id: parseInt(chatId),
        message: messageToSend,
      })

      setFocus("content")
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(handleSendMessage)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          onInputBlur?.()
        }
      }}
      className={classNames(
        "mt-4 flex items-end gap-2 absolute inset-0 top-auto px-4 z-20",
        className,
      )}
      style={{
        bottom: "calc(var(--tg-viewport-safe-area-inset-bottom) + var(--safe-padding) + 10px",
      }}
    >
      <div className='flex-1'>
        <div className='min-w-0 z-20 h-5'>
          {isTyping && (
            <span className='subtitle-bold truncate text-white-70 block'>
              {typingUserName} {t("typing")}...
            </span>
          )}
        </div>
        <TextareaField
          name='content'
          type='rounded'
          register={register}
          error={errors.content}
          placeholder={placeholder}
          appearance='liquid-glass'
          spellCheck={false}
          onFocus={(e) => {
            onInputFocus?.()
            e.preventDefault()
          }}
          onInput={() => onTyping?.()}
        />
      </div>

      <AnimatePresence mode='popLayout'>
        {messageText?.trim() && (
          <motion.button
            type='button'
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleSubmit(handleSendMessage)}
            disabled={sendMessageMutation.isPending}
            className='bg-accent rounded-full flex items-center justify-center disabled:opacity-50 w-[46px] h-[46px]'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {sendMessageMutation.isPending ? (
              <div className='w-4 h-4 border-2 border-white-20 border-t-white rounded-full animate-spin' />
            ) : (
              <img src={IconArrow} alt='' />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  )
}
