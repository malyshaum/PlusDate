import { LottieComponent } from "@/shared/ui"
import AnimationData from "@/../public/animations/PD_em8.json"

interface Props {
  className?: string
}

export const PremiumIconAnimation = ({ className }: Props) => {
  return (
    <div className={className}>
      <LottieComponent animationData={AnimationData} height={24} width={24} />
    </div>
  )
}
