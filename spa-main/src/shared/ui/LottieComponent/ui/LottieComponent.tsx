import Lottie from "lottie-react"
import { memo, type CSSProperties, useMemo } from "react"

interface Props {
  animationData: unknown
  height?: number
  width?: number
  className?: string
  style?: CSSProperties
  autoplay?: boolean
  loop?: boolean
}

export const LottieComponent = memo(({
  animationData,
  height,
  width,
  className,
  style,
  autoplay = true,
  loop = true,
}: Props) => {
  const mergedStyle = useMemo(() => ({ height, width, ...style }), [height, width, style])

  return (
    <Lottie
      animationData={animationData}
      className={className}
      style={mergedStyle}
      autoplay={autoplay}
      loop={loop}
    />
  )
})
