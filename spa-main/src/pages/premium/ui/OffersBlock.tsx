import { Swiper, SwiperSlide } from "swiper/react"
import { getInitialSlideIndex, plans, sliderItems } from "../lib/constants.ts"
import { useSearchParams } from "react-router-dom"
import { Autoplay, Pagination } from "swiper/modules"
import styles from "../styles/index.module.css"
import { LottieComponent, OfferCard } from "@/shared/ui"
import classNames from "classnames"
import type { Range } from "@/pages/premium/model/types.ts"
import { useTranslation } from "react-i18next"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

interface OffersBlockProps {
  selectedPlan: Range
  onPlanSelect: (plan: Range) => void
  currentPlan?: Range | null
}

export const OffersBlock = ({ selectedPlan, onPlanSelect, currentPlan }: OffersBlockProps) => {
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const [searchParams] = useSearchParams()
  const sourceFeature = searchParams.get("sourceFeature")

  const handleSelectedPlan = (plan: Range) => {
    if (currentPlan) return
    triggerImpact()
    onPlanSelect(plan)
  }

  return (
    <div>
      <Swiper
        initialSlide={getInitialSlideIndex(sourceFeature)}
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className={classNames("h-[207px] !mt-[50px] !mx-5 max-w-full", styles["custom-swiper"])}
      >
        {sliderItems.map((item, index) => (
          <SwiperSlide key={index}>
            <div className='relative h-full overflow-hidden'>
              {item.animationData && (
                <div className='mx-auto h-20 w-20 flex items-center justify-center mb-2'>
                  <LottieComponent
                    animationData={item.animationData}
                    height={80}
                    width={80}
                    style={item.style}
                  />
                </div>
              )}
              <h1 className='title1-bold text-center mb-1'>{t(item.titleKey)}</h1>
              <p className='caption1-medium text-center opacity-50'>{t(item.subtitleKey)}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        slidesPerView={"auto"}
        height={150}
        spaceBetween={8}
        className={classNames("w-full !mt-[50px] !px-4 !overflow-visible")}
      >
        {plans.map((item, index) => {
          const isPurchased = currentPlan === item.range
          return (
            <SwiperSlide className='!w-auto' key={index}>
              <OfferCard
                period={t(item.titleKey)}
                stickyLabel={item?.subtitleKey ? t(item.subtitleKey) : undefined}
                periodNumber={item.periodNumber}
                priceDollar={item.priceDollar}
                priceStar={item.priceStar}
                priceDiscount={item.priceDiscount}
                selected={item.range === selectedPlan}
                purchased={isPurchased}
                purchasedLabel={t("purchased")}
                onClick={() => handleSelectedPlan(item.range)}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
