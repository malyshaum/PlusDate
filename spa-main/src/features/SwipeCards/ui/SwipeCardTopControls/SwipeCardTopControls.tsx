import { memo, useCallback } from "react"
import { RevertDislike } from "../RevertDislike"
import IconFilters from "@/shared/assets/icons/icon-filters.svg"
import { useAppliedFiltersCount } from "@/entities/user/lib/useAppliedFiltersCount"
import { useUser } from "@/entities/user/api/queries"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useNavigate } from "react-router-dom"
import { useSwipeFeedStore } from "../../model/store"

interface SwipeCardTopControlsProps {
  onRevert?: () => void
}

const SwipeCardTopControlsComponent = ({ onRevert }: SwipeCardTopControlsProps) => {
  const { data: user } = useUser()
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const appliedFiltersCount = useAppliedFiltersCount(user)
  const canRevert = useSwipeFeedStore((state) => state.canRevert)
  const lastDislikeSwipeId = useSwipeFeedStore((state) => state.lastDislikeSwipeId)

  const openFilters = useCallback(() => {
    triggerImpact()
    void navigate("/preferences")
  }, [navigate, triggerImpact])

  return (
    <>
      {canRevert && onRevert && (
        <RevertDislike canRevert={canRevert} onClick={onRevert} disabled={!lastDislikeSwipeId} />
      )}

      <button
        className='absolute top-3 right-3 z-42 h-8 px-2 rounded-full bg-dark-35 flex items-center gap-1'
        onClick={openFilters}
      >
        <img src={IconFilters} alt='filters' className='w-[15px] h-[15px]' />
        {appliedFiltersCount > 0 && (
          <div className='bg-accent caption1-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1'>
            {appliedFiltersCount}
          </div>
        )}
      </button>
    </>
  )
}

export const SwipeCardTopControls = memo(SwipeCardTopControlsComponent)
