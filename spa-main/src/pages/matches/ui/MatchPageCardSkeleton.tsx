import { memo } from "react"
import classNames from "classnames"
import { Skeleton } from "@/shared/ui/Skeleton"

const MatchPageCardSkeletonComponent = () => {
  return (
    <div
      className={classNames(
        "w-[calc(50%-6px)] rounded-[16px] overflow-hidden aspect-[167/220] relative border border-white-20",
      )}
    >
      <Skeleton className='absolute inset-0 w-full h-full rounded-[16px]' />

      <div className='flex flex-col justify-end absolute bottom-0 left-0 right-0 p-1 h-[45%]'>
        <div className='flex items-center mb-2'>
          <Skeleton className='h-4 w-20 rounded-[4px]' />
        </div>

        <Skeleton className='w-full h-10 rounded-[16px]' />
      </div>
    </div>
  )
}

export const MatchPageCardSkeleton = memo(MatchPageCardSkeletonComponent)
