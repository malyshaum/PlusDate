import { memo } from "react"
import classNames from "classnames"

interface SkeletonProps {
  className?: string
}

const SkeletonComponent = ({ className }: SkeletonProps) => {
  return <div className={classNames("bg-white-10 relative skeleton-shimmer", className)} />
}

export const Skeleton = memo(SkeletonComponent)
