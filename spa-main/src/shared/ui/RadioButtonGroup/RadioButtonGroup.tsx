import classNames from "classnames"
import IconCheckSmall from "@/shared/assets/icons/icon-check-small.svg"
import type { ReactNode } from "react"

interface RadioButtonOption {
  id: string
  title: string
  subtitle: string
  price: string | ReactNode
  note?: string
  highlighted?: boolean
}

interface RadioButtonGroupProps {
  options: RadioButtonOption[]
  value?: string
  onChange: (value: string) => void
  name: string
  disabled?: boolean
}

export const RadioButtonGroup = ({
  options,
  value,
  onChange,
  name,
  disabled = false,
}: RadioButtonGroupProps) => {
  return (
    <ul>
      {options.map((option, index, array) => (
        <li key={option.id}>
          <label
            className={classNames(
              "px-4 py-[14px] flex items-center justify-between border",
              value === option.id ? "border-accent" : "bg-white-10 border-transparent",
              { "rounded-tr-[8px] rounded-tl-[8px]": index === 0 },
              { "rounded-br-[8px] rounded-bl-[8px]": index === array.length - 1 },
              { "pointer-events-none": disabled },
            )}
            style={
              value === option.id
                ? {
                    background:
                      "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(90deg, rgba(255, 61, 108, 0.2) 0%, rgba(255, 61, 108, 0) 100%)",
                  }
                : undefined
            }
          >
            <div className='flex items-center gap-4'>
              <div
                className={classNames(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  value === option.id ? "bg-white" : "bg-white-10",
                )}
              >
                <img
                  src={IconCheckSmall}
                  alt='check'
                  className={value === option.id ? "opacity-100" : "opacity-0"}
                />
              </div>
              <div>
                <div className='flex items-center gap-1'>
                  <div className='body-bold'>{option.title}</div>
                  {option.note && (
                    <div className='subtitle-medium bg-attention py-[2px] px-[4.5px] rounded-[58px]'>
                      {option.note}
                    </div>
                  )}
                </div>
                <div className='mt-1 caption1-medium opacity-50'>{option.subtitle}</div>
              </div>
            </div>
            <div className='text-right'>
              <div className='body-bold'>{option.price}</div>
            </div>
            <input
              type='radio'
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className='sr-only'
            />
          </label>
        </li>
      ))}
    </ul>
  )
}
