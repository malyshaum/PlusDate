import React, { useRef, useEffect, useCallback, type CSSProperties } from "react"
import { debounce } from "lodash"
import classNames from "classnames"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export interface WheelPickerOption {
  value: string
  label: string
}

export interface CustomWheelPickerProps {
  options: WheelPickerOption[]
  value: string
  onChange: (value: string) => void
  visibleCount?: number
  itemHeight?: number
  itemSuffix?: string
}

interface ItemStyle extends CSSProperties {
  opacity: number
  transform: string
}

export const CustomWheelPicker: React.FC<CustomWheelPickerProps> = ({
  options = [],
  value,
  onChange,
  visibleCount = 5,
  itemHeight = 50,
  itemSuffix,
}) => {
  const { triggerImpact } = useHapticFeedback()

  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const scrollYRef = useRef<number>(0)
  const lastEmittedValueRef = useRef<string>(value)
  const isTouchingRef = useRef<boolean>(false)
  const isInitialized = useRef<boolean>(false)
  const lastHapticIndexRef = useRef<number>(-1)

  const [isPointerDragging, setIsPointerDragging] = React.useState(false)

  const isDraggingRef = useRef(false)
  const lastClientYRef = useRef<number | null>(null)
  const startedOnScrollerRef = useRef(false)
  const moveHistoryRef = useRef<Array<{ dy: number; time: number }>>([])
  const inertiaRafRef = useRef<number | null>(null)

  const calculateItemStyle = useCallback(
    (index: number, scrollY: number): ItemStyle => {
      const currentScrollIndex = scrollY / itemHeight
      const distance = Math.abs(index - currentScrollIndex)

      const maxDistance = 3
      const normalizedDistance = Math.min(distance / maxDistance, 1)

      const falloff = 1 - Math.pow(normalizedDistance, 1)

      const opacity = Math.max(0.2, falloff)
      const scale = Math.max(0.2, 0.2 + falloff * 0.7)

      return {
        opacity,
        transform: `scale(${scale}) translateZ(0)`,
      }
    },
    [itemHeight],
  )

  const updateItemStyles = useCallback(
    (scrollY: number) => {
      itemsRef.current.forEach((item, index) => {
        if (item) {
          const style = calculateItemStyle(index, scrollY)
          item.style.opacity = style.opacity.toString()
          item.style.transform = style.transform
        }
      })
    },
    [calculateItemStyle],
  )

  const debouncedOnChange = useCallback(debounce(onChange, 100), [onChange])

  const handleOnChange = useCallback(
    (scrollTop: number) => {
      const index = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1))

      if (options[clampedIndex]) {
        const newValue = options[clampedIndex].value
        if (newValue !== lastEmittedValueRef.current) {
          lastEmittedValueRef.current = newValue
          debouncedOnChange(newValue)
        }
      }
    },
    [itemHeight, options, debouncedOnChange],
  )

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop
      scrollYRef.current = scrollTop

      updateItemStyles(scrollTop)

      const currentIndex = Math.round(scrollTop / itemHeight)
      if (currentIndex !== lastHapticIndexRef.current && isInitialized.current) {
        lastHapticIndexRef.current = currentIndex
        triggerImpact("light")
      }

      if (!isTouchingRef.current) {
        handleOnChange(scrollTop)
      }
    },
    [updateItemStyles, handleOnChange, itemHeight, triggerImpact],
  )

  const handleTouchStart = useCallback(() => {
    isTouchingRef.current = true
  }, [])

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false
    handleOnChange(scrollYRef.current)
  }, [handleOnChange])

  const onWrapperPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const scrollerElement = containerRef.current
    const rect = scrollerElement.getBoundingClientRect()
    const isOnScroller =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom

    startedOnScrollerRef.current = isOnScroller

    if (isOnScroller) {
      return
    }

    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current)
      inertiaRafRef.current = null
    }

    isDraggingRef.current = true
    lastClientYRef.current = e.clientY
    isTouchingRef.current = true
    setIsPointerDragging(true)
    moveHistoryRef.current = []
  }, [])

  const onWrapperPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (startedOnScrollerRef.current) {
        return
      }

      if (!isDraggingRef.current || !containerRef.current) return

      const lastY = lastClientYRef.current ?? e.clientY
      const dy = lastY - e.clientY
      const now = Date.now()

      moveHistoryRef.current.push({ dy, time: now })
      if (moveHistoryRef.current.length > 5) {
        moveHistoryRef.current.shift()
      }

      containerRef.current.scrollTop += dy
      scrollYRef.current = containerRef.current.scrollTop
      updateItemStyles(scrollYRef.current)

      const currentIndex = Math.round(scrollYRef.current / itemHeight)
      if (currentIndex !== lastHapticIndexRef.current && isInitialized.current) {
        lastHapticIndexRef.current = currentIndex
        triggerImpact("light")
      }

      lastClientYRef.current = e.clientY
      e.preventDefault()
    },
    [updateItemStyles, itemHeight, triggerImpact],
  )

  const startInertia = useCallback(() => {
    if (moveHistoryRef.current.length < 2) {
      return
    }

    const recentMoves = moveHistoryRef.current.slice(-5)
    const totalDy = recentMoves.reduce((sum, move) => sum + move.dy, 0)
    const totalTime = recentMoves[recentMoves.length - 1].time - recentMoves[0].time

    if (totalTime === 0) return

    let velocity = (totalDy / totalTime) * 16

    const friction = 0.85
    const minVelocity = 0.5

    const animate = () => {
      if (!containerRef.current || Math.abs(velocity) < minVelocity) {
        if (containerRef.current) {
          const index = Math.round(containerRef.current.scrollTop / itemHeight)
          const clampedIndex = Math.max(0, Math.min(index, options.length - 1))
          const target = clampedIndex * itemHeight

          containerRef.current.scrollTo({ top: target, behavior: "smooth" })
          scrollYRef.current = target
          handleOnChange(target)
        }

        inertiaRafRef.current = null
        setIsPointerDragging(false)
        return
      }

      containerRef.current.scrollTop += velocity
      scrollYRef.current = containerRef.current.scrollTop
      updateItemStyles(scrollYRef.current)

      const currentIndex = Math.round(scrollYRef.current / itemHeight)
      if (currentIndex !== lastHapticIndexRef.current && isInitialized.current) {
        lastHapticIndexRef.current = currentIndex
        triggerImpact("light")
      }

      velocity *= friction
      inertiaRafRef.current = requestAnimationFrame(animate)
    }

    inertiaRafRef.current = requestAnimationFrame(animate)
  }, [itemHeight, options.length, updateItemStyles, handleOnChange, triggerImpact])

  const finishDrag = useCallback(() => {
    startedOnScrollerRef.current = false

    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    lastClientYRef.current = null
    isTouchingRef.current = false

    startInertia()
  }, [startInertia])

  useEffect(() => {
    const index = options.findIndex((opt) => opt.value === value)
    lastEmittedValueRef.current = value

    if (index !== -1) {
      const targetScroll = index * itemHeight
      if (containerRef.current) {
        containerRef.current.scrollTop = targetScroll
        scrollYRef.current = targetScroll
        updateItemStyles(targetScroll)
        setTimeout(() => {
          isInitialized.current = true
        }, 100)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (inertiaRafRef.current !== null) {
        cancelAnimationFrame(inertiaRafRef.current)
      }
    }
  }, [])

  return (
    <div
      className='relative w-full h-full flex items-center justify-center overflow-y-auto overscroll-contain'
      onPointerDown={onWrapperPointerDown}
      onPointerMove={onWrapperPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
    >
      <div
        className='relative overflow-hidden'
        style={{
          height: `${itemHeight * visibleCount}px`,
        }}
      >
        <div
          ref={containerRef}
          className={classNames("h-full overflow-y-auto overscroll-contain", {
            "snap-y snap-mandatory scroll-smooth": isInitialized.current && !isPointerDragging,
            "scroll-auto": isPointerDragging,
          })}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ height: `${((visibleCount - 1) / 2) * itemHeight}px` }} />

          {options.map((option, index) => {
            const initialStyle = calculateItemStyle(index, 0)
            return (
              <div
                key={option.value}
                ref={(el) => {
                  itemsRef.current[index] = el
                }}
                className='flex items-center justify-center select-none title2-bold'
                style={{
                  height: `${itemHeight}px`,
                  scrollSnapAlign: "center",
                  willChange: "transform, opacity",
                  ...initialStyle,
                }}
              >
                <span>
                  {option.label} {itemSuffix}
                </span>
              </div>
            )
          })}

          <div style={{ height: `${((visibleCount - 1) / 2) * itemHeight}px` }} />
        </div>
      </div>
    </div>
  )
}
