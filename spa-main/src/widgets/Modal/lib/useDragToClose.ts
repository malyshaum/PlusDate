import { useMotionValue, type MotionValue } from "framer-motion"

interface UseDragToCloseOptions {
  onClose: () => void
  threshold?: number
  enabled?: boolean
}

interface UseDragToCloseReturn {
  y: MotionValue<number>
  dragProps: {
    drag: "y"
    dragDirectionLock: true
    dragConstraints: { top: number; bottom: number }
    dragElastic: { top: number; bottom: number }
    onDragEnd: () => void
  }
}

export const useDragToClose = ({
  onClose,
  threshold = 40,
  enabled = true,
}: UseDragToCloseOptions): UseDragToCloseReturn => {
  const y = useMotionValue(0)

  const handleDragEnd = () => {
    if (enabled && y.get() >= threshold) {
      onClose()
    }
    y.set(0)
  }

  return {
    y,
    dragProps: {
      drag: "y",
      dragDirectionLock: true,
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: { top: 0, bottom: 0.5 },
      onDragEnd: handleDragEnd,
    },
  }
}
