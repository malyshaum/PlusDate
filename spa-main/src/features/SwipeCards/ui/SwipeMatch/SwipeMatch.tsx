import type { IUser } from "@/entities/user/model/types.ts"
import { withTranslation, type WithTranslation } from "react-i18next"
import { AnimatePresence, motion, useAnimationControls } from "framer-motion"
import { Button, Emoji, LottieComponent } from "@/shared/ui"
import { useState, useCallback, useRef, useEffect } from "react"
import AnimationData from "@/../public/animations/PD_em7.json"
import { matchAnimations, matchStyles } from "./animations"
import { useExternalUser, useUser } from "@/entities/user/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { useToast } from "@/shared/lib/useToast"
import { type IChat, useSendMessage } from "@/entities/chats"
import bg from "@/shared/assets/images/background_match.png"
import { MessageForm } from "@/pages/chat/ui/MessageForm"
import { useNavigate } from "react-router-dom"

const QUICK_EMOJIS = ["❤️", "😊", "👋", "🔥"] as const

interface Props extends WithTranslation {
  matchUser: IUser
  onClose: () => void
  closeButtonLabel?: string
  chat: IChat
}

const SwipeMatchBase = ({
  matchUser,
  t,
  onClose,
  chat,
  closeButtonLabel = "match.continueSwiping",
}: Props) => {
  const { data: user } = useUser()
  const { data: meUser } = useExternalUser(user?.id)
  const { triggerImpact } = useHapticFeedback()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const image1 = meUser?.files?.find((f) => f.is_main && f.type === "image")?.url
  const image2 = matchUser?.files?.find((f) => f.is_main && f.type === "image")?.url

  const [imagesLoaded, setImagesLoaded] = useState({ image1: false, image2: false })
  const [isVisible, setIsVisible] = useState(true)
  const allImagesLoaded = imagesLoaded.image1 && imagesLoaded.image2

  const isInputFocusedRef = useRef(false)
  const titleControls = useAnimationControls()
  const bottomControls = useAnimationControls()
  const buttonsContainerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleInputFocus = useCallback(() => {
    isInputFocusedRef.current = true
    buttonsContainerRef.current?.classList.remove("mt-auto")

    void titleControls.start({
      opacity: 0,
      height: 0,
      overflow: "hidden",
      transition: { duration: 0.2, ease: "easeInOut" },
    })
    void bottomControls.start({
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    })
  }, [titleControls, bottomControls])

  const handleInputBlur = useCallback(() => {
    isInputFocusedRef.current = false
    buttonsContainerRef.current?.classList.add("mt-auto")

    void titleControls.start({
      opacity: 1,
      height: "120px",
      overflow: "visible",
      transition: { duration: 0.25, ease: "easeInOut", delay: 0.3 },
    })
    void bottomControls.start({
      opacity: 1,
      height: "auto",
      transition: { duration: 0.25, ease: "easeInOut", delay: 0.3 },
    })
  }, [titleControls, bottomControls])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const baselineHeight = { current: vv.height }

    const onResize = () => {
      const kbHeight = baselineHeight.current - vv.height
      const kbOpen = kbHeight > 80

      if (!kbOpen && isInputFocusedRef.current) {
        formRef.current?.querySelector("textarea")?.blur()
        handleInputBlur()
      }

      if (vv.height > baselineHeight.current) {
        baselineHeight.current = vv.height
      }
    }

    vv.addEventListener("resize", onResize)
    return () => vv.removeEventListener("resize", onResize)
  }, [handleInputBlur])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  const handleImage1Load = useCallback(() => {
    setImagesLoaded((prev) => ({ ...prev, image1: true }))
  }, [])

  const handleImage2Load = useCallback(() => {
    setImagesLoaded((prev) => ({ ...prev, image2: true }))
  }, [])

  const handleImage1Error = useCallback(() => {
    handleClose()
  }, [handleClose])

  const handleImage2Error = useCallback(() => {
    handleClose()
  }, [handleClose])

  const handleMessageSent = useCallback(() => {
    handleClose()
    showToast({
      text: "match.messageSent",
      onClick: () => navigate(`/chat/${chat.id}?userId=${matchUser.id}`),
    })
  }, [chat.id, handleClose, matchUser.id, navigate, showToast])

  const sendMessageMutation = useSendMessage({
    onSuccess: () => {
      showToast({
        text: "match.messageSent",
        onClick: () => navigate(`/chat/${chat.id}?userId=${matchUser.id}`),
      })
      handleClose()
    },
  })

  const handleEmojiClick = useCallback(
    async (emoji: string) => {
      triggerImpact()
      await sendMessageMutation.mutateAsync({
        chat_id: chat.id,
        message: emoji,
      })
      handleClose()
    },
    [triggerImpact, sendMessageMutation, chat.id, handleClose],
  )

  if (!image1 || !image2) {
    return null
  }

  return (
    <AnimatePresence mode='wait' onExitComplete={onClose}>
      {isVisible && (
        <motion.div
          key='match-modal'
          initial={matchAnimations.modal.initial}
          animate={{ opacity: allImagesLoaded ? 1 : 0, scale: allImagesLoaded ? 1 : 0.9 }}
          exit={matchAnimations.modal.exit}
          transition={matchAnimations.modal.transition}
          className='fixed inset-0 z-9999 w-full h-full'
        >
          <div
            className='flex flex-col px-4 relative overflow-hidden'
            style={{
              height: "100%",
            }}
          >
            <img src={bg} alt='' className='absolute inset-0 pointer-events-none z-0' />
            <div
              className='relative z-10 flex flex-col min-h-0 overflow-hidden pb-5'
              style={{
                paddingTop:
                  "calc(var(--tg-viewport-safe-area-inset-top, 0px) + var(--tg-viewport-content-safe-area-inset-top, 0px) + 70px)",
              }}
            >
              <div className='h-[225px] relative flex-shrink-0 mb-6'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-2'>
                  <LottieComponent animationData={AnimationData} height={80} width={80} />
                </div>

                <motion.img
                  src={image1}
                  alt=''
                  onLoad={handleImage1Load}
                  onError={handleImage1Error}
                  className='w-[165px] h-[225px] rounded-[32px] overflow-hidden isolate absolute object-cover rotate-[-7deg]  left-6 z-1'
                  initial={matchAnimations.userImage.initial}
                  animate={matchAnimations.userImage.animate}
                  transition={matchAnimations.userImage.transition}
                />
                <motion.img
                  src={image2}
                  alt=''
                  onLoad={handleImage2Load}
                  onError={handleImage2Error}
                  className='w-[165px] h-[225px] rounded-[32px] overflow-hidden isolate absolute object-cover rotate-[10deg] right-8 z-2'
                  initial={matchAnimations.matchUserImage.initial}
                  animate={matchAnimations.matchUserImage.animate}
                  transition={matchAnimations.matchUserImage.transition}
                />
              </div>
              <motion.div animate={titleControls} className='pb-4 text-center h-[120px]'>
                <div className='relative'>
                  <motion.div
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-[52px] leading-[100%] font-extrabold text-[rgba(139,38,62,0.6)] select-none pointer-events-none'
                    initial={matchAnimations.titleShadow1.initial}
                    animate={matchAnimations.titleShadow1.animate}
                    transition={matchAnimations.titleShadow1.transition}
                  >
                    {t("match.title")}
                  </motion.div>

                  <motion.div
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-[52px] leading-[100%] font-extrabold text-[rgba(139,38,62,0.9)] select-none pointer-events-none'
                    initial={matchAnimations.titleShadow2.initial}
                    animate={matchAnimations.titleShadow2.animate}
                    transition={matchAnimations.titleShadow2.transition}
                  >
                    {t("match.title")}
                  </motion.div>

                  <motion.div
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-[52px] leading-[100%] font-extrabold select-none pointer-events-none'
                    style={matchStyles.titleGradient}
                    initial={matchAnimations.titleMain.initial}
                    animate={matchAnimations.titleMain.animate}
                    transition={matchAnimations.titleMain.transition}
                  >
                    {t("match.title")}
                  </motion.div>

                  <motion.div
                    initial={matchAnimations.description.initial}
                    animate={matchAnimations.description.animate}
                    transition={matchAnimations.description.transition}
                    className='body-regular'
                  >
                    {t("match.description", { name: matchUser.name })}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div
              ref={buttonsContainerRef}
              initial={matchAnimations.buttons.initial}
              animate={matchAnimations.buttons.animate}
              transition={matchAnimations.buttons.transition}
              className='relative z-10 flex flex-col gap-2 mt-auto'
            >
              <MessageForm
                chatId={String(chat.id)}
                onSuccess={handleMessageSent}
                onInputFocus={handleInputFocus}
                onInputBlur={handleInputBlur}
                className='!static !px-0 !mt-0'
                placeholder={t("match.messagePlaceholder")}
              />
              <motion.div
                animate={bottomControls}
                style={{ overflow: "hidden" }}
                className='flex flex-col gap-2'
              >
                <div className='flex gap-1 mb-16'>
                  {QUICK_EMOJIS.map((emoji) => (
                    <Emoji
                      key={emoji}
                      emoji={emoji}
                      className='flex-1'
                      disabled={sendMessageMutation.isPending}
                      onClick={() => handleEmojiClick(emoji)}
                    />
                  ))}
                </div>
                <Button size='L' appearance='white' onClick={handleClose} className='mb-10'>
                  {t(closeButtonLabel)}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const SwipeMatch = withTranslation()(SwipeMatchBase)
