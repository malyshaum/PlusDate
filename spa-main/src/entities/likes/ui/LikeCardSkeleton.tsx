import { memo } from "react"
import classNames from "classnames"
import { Skeleton } from "@/shared/ui/Skeleton"

interface LikeCardSkeletonProps {
  showActions?: boolean
}

const LikeCardSkeletonComponent = ({ showActions = false }: LikeCardSkeletonProps) => {
  return (
    <div
      className={classNames(
        "w-[calc(50%-6px)] rounded-[16px] overflow-hidden aspect-[167/220] relative border border-white-20",
      )}
    >
      <Skeleton className='absolute inset-0 w-full h-full rounded-[16px]' />

      {showActions && (
        <div className='flex flex-col justify-end absolute bottom-0 left-0 right-0 p-1 h-[45%]'>
          <div className='flex items-center mb-2'>
            <Skeleton className='h-4 w-20 rounded-[4px]' />
          </div>

          <div className='flex gap-1'>
            <Skeleton className='flex-1 h-10 rounded-[16px]' />
            <Skeleton className='flex-1 h-10 rounded-[16px]' />
          </div>
        </div>
      )}
    </div>
  )
}

export const LikeCardSkeleton = memo(LikeCardSkeletonComponent)
