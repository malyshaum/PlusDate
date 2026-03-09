import { NavLink } from "react-router-dom"
import classNames from "classnames"

interface Props {
  to: string
  label: string
  value: string
  icon?: string
  iconAlt?: string
  className?: string
  showIndicator?: boolean
}

export const SelectorLink = ({
  to,
  label,
  className,
  value,
  icon,
  iconAlt,
  showIndicator,
}: Props) => {
  return (
    <NavLink
      to={to}
      className={classNames(
        "relative flex items-center justify-between bg-white-10 rounded-[8px] px-4 py-[14px] h-[52px] gap-2",
        showIndicator && "bg-button-link-warning",
        className,
      )}
    >
      {showIndicator && (
        <div className='absolute right-1 top-1 bg-attention h-2 w-2 rounded-full z-1' />
      )}
      <div className='flex items-center gap-1'>
        {icon && <img src={icon} alt={iconAlt} height={24} width={24} />}
        <span className='body-regular text-nowrap'>{label}</span>
      </div>
      <span className='text-blue button-main capitalize text-right text-nowrap overflow-hidden flex-1'>
        {value}
      </span>
    </NavLink>
  )
}
