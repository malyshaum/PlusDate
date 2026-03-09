import { useState } from "react"
import { withTranslation, type WithTranslation } from "react-i18next"
import { AnimatePresence, motion } from "framer-motion"
import {
  useFloating,
  FloatingPortal,
  useDismiss,
  useInteractions,
  useClick,
  offset,
  flip,
  shift,
} from "@floating-ui/react"
import classNames from "classnames"
import IconInfoWarning from "@/shared/assets/icons/icon-info-warning.svg?react"
import IconInfo from "@/shared/assets/icons/icon-info.svg"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { UserModerationReasons } from "@/shared/const/constants.ts"

interface Props extends WithTranslation {
  rejectionReason?: number
  message?: string
  className?: string
}

const ModerationInfoTooltipBase = ({ rejectionReason, message, className, t }: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context, placement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [
      offset({ mainAxis: 0, crossAxis: 10, alignmentAxis: 10 }),
      flip({
        fallbackPlacements: ["bottom-end", "top-start", "top-end"],
      }),
      shift({
        boundary: "clippingAncestors",
        crossAxis: true,
      }),
    ],
  })

  const click = useClick(context)
  const dismiss = useDismiss(context, {
    capture: true,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  const isEndPlacement = placement.includes("end")
  const cornerRadiusClass = isEndPlacement ? "rounded-tr-[1px]" : "rounded-tl-[1px]"

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerImpact()
  }

  return (
    <div className={classNames("absolute top-[6px] left-[6px]", className)}>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: handleInfoClick,
        })}
        type='button'
        className='w-8 h-8 flex justify-center items-center bg-dark-35 rounded-full'
      >
        <img src={IconInfo} alt='info' />
      </button>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              className={classNames(
                "max-w-[174px] w-full rounded-lg px-3 py-2 bg-dark-35 backdrop-blur-[35px] flex items-start gap-1",
                cornerRadiusClass,
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0 }}
              {...getFloatingProps()}
            >
              <IconInfoWarning />
              <span className='subtitle-medium-no-caps flex-1'>
                {message ??
                  t(UserModerationReasons[rejectionReason as keyof typeof UserModerationReasons])}
              </span>
            </motion.div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ModerationInfoTooltip = withTranslation()(ModerationInfoTooltipBase)
