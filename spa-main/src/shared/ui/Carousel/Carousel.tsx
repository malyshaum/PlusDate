import { Swiper } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import classNames from "classnames"
import { type PropsWithChildren, useCallback, useRef } from "react"
import type { Swiper as SwiperType } from "swiper"
import styles from "./index.module.css"

interface Props extends PropsWithChildren {
  onSlideChange?: (index: number) => void
  onPrevious?: () => void
  onNext?: () => void
  enablePagination?: boolean
  slidesPerView?: number | "auto"
  spaceBetween?: number
  className?: string
  enableSidesNavigation?: boolean
}

export const Carousel = ({
  onSlideChange,
  onPrevious,
  onNext,
  enablePagination,
  spaceBetween,
  slidesPerView,
  enableSidesNavigation,
  className,
  children,
}: Props) => {
  const swiperRef = useRef<SwiperType | null>(null)

  const scrollPrev = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
    onPrevious?.()
  }, [onPrevious])

  const scrollNext = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
    onNext?.()
  }, [onNext])

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.activeIndex
      onSlideChange?.(newIndex)
    },
    [onSlideChange],
  )

  const modules = [Navigation]
  if (enablePagination) {
    modules.push(Pagination)
  }

  return (
    <Swiper
      modules={modules}
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      onSlideChange={handleSlideChange}
      onSwiper={(swiper) => {
        swiperRef.current = swiper
      }}
      pagination={{
        clickable: true,
        enabled: enablePagination,
      }}
      allowTouchMove={true}
      className={classNames("w-full h-full", styles["custom-swiper"], className)}
    >
      {children}
      {enableSidesNavigation && (
        <>
          <div
            className='absolute h-full w-[25%] top-0 left-0 bottom-0 bg-transparent z-10 cursor-pointer'
            onClick={scrollPrev}
          />
          <div
            className='absolute h-full w-[25%] top-0 right-0 bottom-0 bg-transparent z-10 cursor-pointer'
            onClick={scrollNext}
          />
        </>
      )}
    </Swiper>
  )
}
