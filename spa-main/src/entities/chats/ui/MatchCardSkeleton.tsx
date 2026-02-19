import { memo } from "react"
import { Skeleton } from "@/shared/ui"

const MatchCardSkeletonComponent = () => {
  return (
    <div className='flex flex-col items-center flex-shrink-0'>
      <Skeleton className='w-17 h-17 rounded-full' />
      <Skeleton className='mt-1 h-3 w-12 rounded' />
    </div>
  )
}

export const MatchCardSkeleton = memo(MatchCardSkeletonComponent)
