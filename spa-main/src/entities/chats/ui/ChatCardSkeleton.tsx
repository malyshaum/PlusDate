import { memo } from "react"
import { Skeleton } from "@/shared/ui"

const ChatCardSkeletonComponent = () => {
  return (
    <div className='flex items-start gap-2'>
      <Skeleton className='w-16 h-16 rounded-full flex-shrink-0' />

      <div className='flex-1 min-w-0'>
        <div className='h-[64px] mb-3 flex flex-col justify-center gap-2'>
          <div className='flex justify-between items-center'>
            <Skeleton className='h-4 w-24 rounded' />
            <Skeleton className='h-3 w-12 rounded' />
          </div>
          <Skeleton className='h-4 w-full rounded' />
          <Skeleton className='h-4 w-3/4 rounded' />
        </div>
        <div className='h-[1px] bg-white-10' />
      </div>
    </div>
  )
}

export const ChatCardSkeleton = memo(ChatCardSkeletonComponent)
