import { memo, type ReactNode } from "react"
import { withTranslation, type WithTranslation } from "react-i18next"
import classNames from "classnames"
import { LottieComponent } from "@/shared/ui"

interface Props extends WithTranslation {
  inactiveIcon: ReactNode
  activeIcon: ReactNode
  label: string
  isActive: boolean
  count?: number
  showSubIndicator?: boolean
  AnimationData: unknown
}

const transformCount = (count: number) => {
  if (count > 9) {
    return "9+"
  }
  return count
}

export const NavTabBase = memo(
  ({ AnimationData, isActive, count, t, label, showSubIndicator }: Props) => {
    return (
      <div className='relative flex items-center justify-center flex-col pb-[6px]'>
        {!!count && count > 0 && !isActive && (
          <div className='absolute subtitle-medium w-5 h-[18px] rounded-[24px] bg-attention flex items-center justify-center top-[-1px] right-[-8px] z-10'>
            {transformCount(count)}
          </div>
        )}

        {showSubIndicator && !isActive && (
          <div className='absolute w-2 h-2 rounded-full bg-attention flex top-[3px] right-[3px] z-10'></div>
        )}

        <LottieComponent
          key={label + isActive}
          className={classNames("opacity-100", { "!opacity-50": !isActive })}
          animationData={AnimationData}
          height={28}
          width={28}
          autoplay={isActive}
          loop={false}
        />
        <span className={classNames("small-homa", isActive ? "text-white-100" : "text-white-50")}>
          {t(label)}
        </span>
      </div>
    )
  },
)

export const NavTab = withTranslation()(NavTabBase)
