import RangeSliderInput from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"
import classNames from "classnames"
import styles from "./RangeSlider.module.css"

interface Props {
  label: string
  min: number
  max: number
  value: [number, number]
  onInput: (value: [number, number]) => void
  className?: string
}

export const RangeSlider = ({ label, min, max, value, onInput, className = "" }: Props) => {
  const [fromValue, toValue] = value

  const calculatePosition = (val: number) => {
    const percentage = (val - min) / (max - min)
    const dynamicOffset = 6 + percentage * 22
    return `calc(${percentage * 100}% - ${dynamicOffset}px)`
  }

  return (
    <div className={classNames("mb-7", className)}>
      <div className='subtitle-medium text-white-70'>{label}</div>
      <div className='relative pt-18'>
        <div className={styles.container}>
          <div className={styles.valueDisplay} style={{ left: calculatePosition(fromValue) }}>
            <div className={styles.valueBox}>
              {fromValue}
              <div className={styles.valueCaret}></div>
            </div>
          </div>
          <div
            className={styles.valueDisplay}
            style={{
              left: calculatePosition(toValue),
            }}
          >
            <div className={classNames(styles.valueBox, "caption1-medium")}>
              {toValue}
              <div className={styles.valueCaret}></div>
            </div>
          </div>
          <RangeSliderInput
            min={min}
            max={max}
            value={value}
            onInput={onInput}
            className={styles.slider}
          />
        </div>
      </div>
    </div>
  )
}
