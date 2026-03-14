import { AnimatePresence, motion } from "framer-motion"
import { type ReactNode, useEffect } from "react"
import { useDragToClose } from "@/widgets/Modal"

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
  enableDragToClose?: boolean
  dragThreshold?: number
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  enableDragToClose = true,
  dragThreshold = 40,
}: ModalProps) => {
  const { y, dragProps } = useDragToClose({
    onClose: onClose || (() => {}),
    threshold: dragThreshold,
    enabled: enableDragToClose && !!onClose,
  })

  // Reset y position when modal opens
  useEffect(() => {
    if (isOpen) {
      y.set(0)
    }
  }, [isOpen, y])

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          key='modal'
          initial={{ bottom: "-105%", left: 0, right: 0, top: 0 }}
          animate={{
            bottom: 0,
            backgroundColor: "var(--color-dark-35)",
          }}
          exit={{
            bottom: "-105%",
            backgroundColor: "transparent",
          }}
          className='fixed z-110 flex items-end'
          onClick={onClose}
        >
          <motion.div
            {...dragProps}
            style={{ y }}
            className={`bg-grey-10 rounded-tr-[32px] rounded-tl-[32px] px-4 w-full pb-safe-area-bottom ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='pt-2 pb-6 flex justify-center'>
              <div className='bg-grey-50 h-[4px] w-10 rounded-4xl' />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
