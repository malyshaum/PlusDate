import { withTranslation, type WithTranslation } from "react-i18next"
import IconAction from "@/shared/assets/icons/icon-actions.svg"
import { type ReactNode, useState } from "react"
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
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

interface Action {
  label: string
  icon: ReactNode
  onClick: () => void
}

interface Props extends WithTranslation {
  actions: Action[]
}

const ActionMenuBase = ({ t, actions }: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [
      offset(5),
      flip({
        fallbackPlacements: ["bottom-start", "top-end", "top-start"],
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

  return (
    <div className='top-[6px] right-[6px] absolute'>
      <button
        type='button'
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: () => triggerImpact(),
        })}
      >
        <img src={IconAction} alt='icon-action' />
      </button>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <motion.ul
              ref={refs.setFloating}
              style={floatingStyles}
              className='w-[240px] rounded-[16px] flex flex-col overflow-hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0 }}
              {...getFloatingProps()}
            >
              {actions.map((action, index) => {
                return (
                  <li key={action.label} className='w-full'>
                    <button
                      type='button'
                      className={classNames(
                        "w-full flex items-center justify-between bg-grey-10 px-4 py-3",
                        index !== actions.length - 1 && "border-b border-white-10",
                      )}
                      onClick={() => {
                        triggerImpact()
                        action.onClick()
                        setIsOpen(false)
                      }}
                    >
                      <span className='body-medium'>{t(action.label)}</span>
                      {action.icon}
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ActionMenu = withTranslation()(ActionMenuBase)
