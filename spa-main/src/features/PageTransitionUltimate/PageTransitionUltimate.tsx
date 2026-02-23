import { motion } from "framer-motion"
import { type ReactNode, useEffect, useRef } from "react"
import { useLocation, useNavigationType, NavigationType } from "react-router-dom"
import classNames from "classnames"

export type AnimationType = "fade" | "slideInOut"

interface Props {
  children: ReactNode
  type?: AnimationType
  className?: string
  duration?: number
  isMovingForward?: boolean
}

export default function PageTransitionUltimate({
  children,
  type = "fade",
  className,
  duration = 0.3,
  isMovingForward,
}: Props) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const prevPathnameRef = useRef(location.pathname)

  const detectedDirection = navigationType !== NavigationType.Pop

  useEffect(() => {
    prevPathnameRef.current = location.pathname
  }, [location.pathname])

  const direction = isMovingForward !== undefined ? isMovingForward : detectedDirection

  const getAnimationConfig = () => {
    switch (type) {
      case "slideInOut":
        return {
          initial: {
            opacity: 0,
            transform: direction ? "translate3d(100%, 0, 0)" : "translate3d(-100%, 0, 0)",
          },
          animate: {
            opacity: 1,
            transform: "translate3d(0, 0, 0)",
          },
          exit: {
            opacity: 0,
            transform: direction ? "translate3d(-100%, 0, 0)" : "translate3d(100%, 0, 0)",
          },
          // willChange: "transform, opacity",
        }
      case "fade":
      default:
        return {
          initial: {
            opacity: 0,
          },
          animate: {
            opacity: 1,
          },
          exit: {
            opacity: 0,
          },
          // willChange: "opacity",
        }
    }
  }

  const animationConfig = getAnimationConfig()

  return (
    <motion.div
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      exit={animationConfig.exit}
      transition={{
        duration,
        ease: "easeInOut",
      }}
      className={classNames("flex-1 flex flex-col h-full overflow-hidden", className)}
      // style={{ willChange: animationConfig.willChange }}
    >
      {children}
    </motion.div>
  )
}
