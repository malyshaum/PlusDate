import { useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SnackbarProps {
  isOpen: boolean
  children: ReactNode
  onClose: () => void
  duration?: number
  className?: string
}

export const Snackbar = ({
  isOpen,
  children,
  onClose,
  duration = 3000,
  className,
}: SnackbarProps) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-3 py-2 bg-grey-10 border border-white-25 rounded-3xl ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
