import { memo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import classNames from "classnames"
import IconChat from "@/shared/assets/icons/icon-chat.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { IUserMatch } from "@/entities/user/model/types"
import { PremiumIconAnimation } from "@/widgets/PremiumIconAnimation/ui/PremiumIconAnimation"
import { motion } from "framer-motion"

interface MatchPageCardProps {
  match: IUserMatch
  handleNavigate?: () => void
}

const MatchPageCardComponent = ({ match, handleNavigate }: MatchPageCardProps) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()

  const handleNavigateToProfile = useCallback(() => {
    triggerImpact()
    handleNavigate?.()
    void navigate(`/user/${match.user_id}?showRemoveMatch=true`, {
      state: { reportSource: "match_profile", chatId: match.chat_id, isViewed: match.is_viewed },
    })
  }, [triggerImpact, handleNavigate, navigate, match.user_id, match.chat_id, match.is_viewed])
  const handleNavigateToChat = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      triggerImpact()
      void navigate(`/chat/${match.chat_id}?userId=${match.user_id}`)
    },
    [navigate, match.chat_id, match.user_id, triggerImpact],
  )

  return (
    <motion.div
      layout
      exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
      transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
      className={classNames(
        "w-[calc(50%-6px)] rounded-[16px] overflow-hidden aspect-[167/220] relative",
        "border border-white-20",
      )}
    >
      <div
        className={classNames("relative w-full h-full rounded-[16px] overflow-hidden z-10")}
        onClick={handleNavigateToProfile}
      >
        {match.url && (
          <img
            src={match.url}
            alt={match.user_name}
            className='absolute inset-0 w-full h-full object-cover'
          />
        )}

        <div className='flex flex-col justify-end absolute bottom-0 left-0 right-0 p-1 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4527)_40.48%,rgba(0,0,0,0.6)_100%)] gap-y-2'>
          <span className='body-regular flex items-center flex-1 min-w-0 !font-bold text-white'>
            <span className='truncate min-w-0'>
              {match.user_name}
              {match.age ? `, ${match.age}` : ""}
            </span>
            {match.is_premium && (
              <PremiumIconAnimation className='flex-shrink-0 ml-[4px] mb-[2px]' />
            )}
          </span>

          <button
            onClick={handleNavigateToChat}
            className='w-full h-[28px] rounded-[16px] backdrop-blur-[16px] bg-white-20 flex items-center justify-center shadow-[inset_-2px_-2px_2px_0px_rgba(255,255,255,0.15)]'
          >
            <IconChat />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export const MatchPageCard = memo(MatchPageCardComponent)
