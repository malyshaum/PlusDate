import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "@/shared/lib/useToast.ts"
import { useEffect } from "react"
import { type WithTranslation, withTranslation } from "react-i18next"
import IconChevronRight from "@/shared/assets/icons/icon-chevron-right.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { PanInfo } from "motion-dom"

interface ToastItemProps {
  id: string
  text: string
  imageUrl?: string
  onClick?: () => void
  index: number
  t: (key: string) => string
  onDismiss: (id: string) => void
  note?: string
}

const TOAST_HEIGHT = 40
const TOAST_SPACING = 16

const getOffsetTop = (index: number) => {
  const safeAreaTop = getComputedStyle(document.documentElement)
    .getPropertyValue("--tg-viewport-safe-area-inset-top")
    .trim()
  const safeContentTop = getComputedStyle(document.documentElement)
    .getPropertyValue("--tg-viewport-content-safe-area-inset-top")
    .trim()

  const baseContentTop = safeContentTop ? parseInt(safeContentTop) : 100
  const baseTop = safeAreaTop ? parseInt(safeAreaTop) : 100
  const offset = index * (TOAST_HEIGHT + TOAST_SPACING)
  return baseContentTop + baseTop + offset
}

const ToastItem = ({ id, text, imageUrl, onClick, index, t, onDismiss, note }: ToastItemProps) => {
  const { triggerImpact } = useHapticFeedback()

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onDismiss])

  const handleClick = () => {
    triggerImpact()
    onClick?.()
    onDismiss(id)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < 0) {
      onDismiss(id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.2 }}
      drag='y'
      dragConstraints={{ bottom: 0 }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{
        top: `${getOffsetTop(index)}px`,
      }}
      className='fixed w-[calc(100%-32px)] left-1/2 -translate-x-1/2 z-9999 bg-grey-10 border border-white-10 rounded-[16px] p-2 flex items-center gap-2'
    >
      {imageUrl && (
        <img src={imageUrl} alt='User' className='w-11 h-11 rounded-full object-cover' />
      )}
      <div className='flex-1 min-w-0'>
        <div className='body-bold text-white-100 truncate'>{t(text)}</div>
        {note && <div className='body-regular text-white-50 mt-1 truncate'>{note}</div>}
      </div>
      <IconChevronRight className='[&_path]:stroke-accent ml-auto' />
    </motion.div>
  )
}

const ToastBase = ({ t }: WithTranslation) => {
  const { toasts, hideToast } = useToast()

  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          text={toast.text}
          note={toast.note}
          imageUrl={toast.imageUrl}
          onClick={toast.onClick}
          index={index}
          t={t}
          onDismiss={hideToast}
        />
      ))}
    </AnimatePresence>
  )
}

export const Toast = withTranslation()(ToastBase)
