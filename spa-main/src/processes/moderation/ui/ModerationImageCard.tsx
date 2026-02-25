import { withTranslation, type WithTranslation } from "react-i18next"
import type { IUserFile } from "@/entities/user/model/types.ts"
import { useState, useRef } from "react"
import IconPencilRounded from "@/shared/assets/icons/icon-pencil-round.svg"
import IconInfoWarning from "@/shared/assets/icons/icon-info-warning.svg?react"
import IconInfo from "@/shared/assets/icons/icon-info.svg"
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
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import classNames from "classnames"
import { UserModerationReasons } from "@/shared/const/constants.ts"

interface Props extends WithTranslation {
  file: IUserFile
  replacedFile?: File | null
  onReplace?: (fileId: number, file: File) => void
  hasModerationIssue: boolean
  rejection_reason?: number | null
}

const ModerationImageCardBase = ({
  file,
  replacedFile,
  onReplace,
  t,
  hasModerationIssue,
  rejection_reason,
}: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { refs, floatingStyles, context, placement } = useFloating({
    open: isInfoOpen,
    onOpenChange: setIsInfoOpen,
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

  const handleReplaceClick = () => {
    triggerImpact()
    fileInputRef.current?.click()
  }

  const handleInfoClick = () => {
    triggerImpact()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && onReplace) {
      onReplace(file.id, selectedFile)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const displayUrl = replacedFile ? URL.createObjectURL(replacedFile) : file.url

  return (
    <div className='relative aspect-[55/72] flex-1 rounded-lg overflow-hidden'>
      <img src={displayUrl} alt='profile' className='w-full h-full object-cover object-center' />

      <div
        className={classNames(
          "absolute inset-0 rounded-lg",
          hasModerationIssue ? "border-2 border-accent" : "border-1 border-white-10",
        )}
      />

      <div className='absolute top-[6px] left-[6px]'>
        {hasModerationIssue && (
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
        )}

        <AnimatePresence>
          {isInfoOpen && (
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
                {rejection_reason && (
                  <span className='subtitle-medium-no-caps flex-1'>
                    {t(
                      UserModerationReasons[rejection_reason as keyof typeof UserModerationReasons],
                    )}
                  </span>
                )}
              </motion.div>
            </FloatingPortal>
          )}
        </AnimatePresence>
      </div>

      {onReplace && (
        <button type='button' className='absolute top-2 right-2' onClick={handleReplaceClick}>
          <img src={IconPencilRounded} alt='replace' width={24} height={24} />
        </button>
      )}

      {onReplace && (
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}

export const ModerationImageCard = withTranslation()(ModerationImageCardBase)
