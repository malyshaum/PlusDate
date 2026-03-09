import classNames from "classnames"
import IconStar from "@/shared/assets/icons/icon-stars.svg?react"

interface Props {
  period: string
  periodNumber: number
  priceStar: number
  priceDollar: number
  priceDiscount?: number
  selected?: boolean
  stickyLabel?: string
  purchased?: boolean
  purchasedLabel?: string
  onClick?: () => void
}

export const OfferCard = ({
  selected,
  stickyLabel,
  priceDiscount,
  priceDollar,
  priceStar,
  period,
  periodNumber,
  purchased,
  purchasedLabel,
  onClick,
}: Props) => {
  const displayLabel = purchased ? purchasedLabel : stickyLabel
  return (
    <div
      className={classNames(
        "items-center rounded-xl px-4 py-[14px] flex flex-col justify-between min-h-[150px] w-[102px]",
        {
          "border border-white-10 bg-white-10": !selected,
          "border border-accent bg-test": selected,
        },
      )}
      style={
        selected
          ? {
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(357.76deg, rgba(255, 61, 108, 0.2) 5.15%, rgba(255, 61, 108, 0) 98.1%)",
            }
          : undefined
      }
      onClick={onClick}
    >
      {displayLabel && (
        <div
          className={classNames(
            "absolute top-[-9px] subtitle-medium uppercase rounded-sm py-[2px] px-1",
            {
              "bg-[#5C5C5C]": !selected && !purchased,
              "bg-accent": selected || purchased,
            },
          )}
        >
          {displayLabel}
        </div>
      )}
      <div className='text-center'>
        <div className='title1-bold'>{periodNumber}</div>
        <div className='body-bold mt-1'>{period}</div>
      </div>

      <div className='flex flex-col items-center'>
        {priceDiscount && (
          <div className='opacity-50 flex items-center gap-1 relative'>
            <span className='caption1-medium'>{priceDiscount}</span>
            <IconStar />
            <span className='w-full absolute top-[50%] translate-y-[-50%] left-0 right-0 h-[2px] bg-[#A09295]' />
          </div>
        )}
        <div className='flex gap-1 mt-[2px]'>
          <span className='body-bold'>{priceStar}</span>
          <IconStar />
        </div>
        <div className='subtitle-medium mt-[2px] text-white-50'>~{priceDollar}$</div>
      </div>
    </div>
  )
}
