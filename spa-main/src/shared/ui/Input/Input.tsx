import React from "react"
import classNames from "classnames"
import type { FieldError } from "react-hook-form"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"

export type InputProps = {
  name?: string
  label?: string
  type?: React.HTMLInputTypeAttribute
  className?: string
  childrenBefore?: React.ReactNode
  placeholder?: string
  note?: string
  error?: FieldError | string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  ref?: React.Ref<HTMLInputElement>
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "className" | "placeholder" | "value" | "onChange" | "onBlur"
>

export const Input: React.FC<InputProps> = ({
  name,
  label,
  type = "text",
  className,
  childrenBefore,
  placeholder,
  note,
  error,
  value,
  onChange,
  onBlur,
  ref,
  ...props
}) => {
  return (
    <div className={classNames("w-full flex flex-col overflow-hidden", className)}>
      {label && (
        <label htmlFor={name} className='subtitle-medium text-white-70 mb-2'>
          {label}
        </label>
      )}
      <div className={classNames("relative flex items-center gap-2 bg-white-10 rounded-[8px]")}>
        <div className='absolute left-4 top-[50%] translate-y-[-50%]'>{childrenBefore}</div>
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? "true" : "false"}
          placeholder={placeholder}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className={classNames(
            "flex-1 body-regular placeholder:text-white-50 outline-0 py-[14.5px] px-4 border-2 rounded-[8px] w-full",
            { "pl-[46px]": childrenBefore },
            {
              "border-attention": error,
              "border-transparent": !error,
              "text-white-50": props?.disabled,
            },
          )}
          {...props}
        />
      </div>
      {note && !error && <p className='caption1-medium mt-1 text-text-grey'>{note}</p>}
      {error && <InputError error={error} />}
    </div>
  )
}
