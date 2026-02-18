import classNames from "classnames"
import { type ReactNode } from "react"
import { PremiumIconAnimation } from "@/widgets"
import IconPremium from "@/shared/assets/images/icon-premium.png"
import { isIPhone } from "@/shared/lib/getDeviceInfo.ts"

interface UserInfoProps {
  name: string
  age: number
  is_premium: boolean
  onToggleExpand?: () => void
  expandButton?: ReactNode
  className?: string
}

export const UserInfo = ({
  name,
  age,
  is_premium,
  onToggleExpand,
  expandButton,
  className,
}: UserInfoProps) => {
  return (
    <div className={classNames("flex items-start justify-between gap-2", className)}>
      <h3 className='title1-regular flex items-center flex-1 min-w-0'>
        <span className='truncate min-w-0'>
          {name}
          {age ? `, ${age}` : ""}
        </span>
        {is_premium &&
          (isIPhone ? (
            <PremiumIconAnimation className='flex-shrink-0 ml-[2px] mb-[2px]' />
          ) : (
            <img src={IconPremium} alt='' className='flex-shrink-0 ml-[2px] mb-[2px] w-6 h-6' />
          ))}
      </h3>
      {expandButton && (
        <button
          onClick={onToggleExpand}
          className='flex items-center button-main text-accent flex-shrink-0 mt-1'
        >
          {expandButton}
        </button>
      )}
    </div>
  )
}
