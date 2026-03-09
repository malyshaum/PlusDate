import React from "react"
import {
  type Path,
  type FieldError,
  type FieldValues,
  Controller,
  type Control,
} from "react-hook-form"
import classNames from "classnames"
import DatePicker from "react-multi-date-picker"
import { useTranslation } from "react-i18next"
import { InputError } from "@/shared/ui/InputError/InputError.tsx"
import "react-multi-date-picker/styles/layouts/mobile.css"
import "./index.css"

export type DateInputProps<T extends FieldValues> = {
  name: Path<T>
  label?: string
  error?: FieldError
  control: Control<T>
  className?: string
  childrenBefore?: React.ReactNode
  placeholder?: string
  note?: string
  maxDate?: Date
}

export const DateInput = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  className,
  childrenBefore,
  placeholder = "YYYY-MM-DD",
  note,
  maxDate,
}: DateInputProps<T>) => {
  const { t } = useTranslation()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, name, value } }) => (
        <>
          <div className={classNames("w-full flex flex-col", className)}>
            {label && (
              <label className='text-[14px] font-medium text-text-dark mb-2 leading-[100%]'>
                {label}
              </label>
            )}

            <div
              className={classNames(
                "relative flex items-center gap-2 bg-white rounded-[12px] border",
                {
                  "border-accent": error,
                  "border-transparent": !error,
                },
              )}
            >
              <div className='absolute left-4 top-[50%] translate-y-[-50%]'>{childrenBefore}</div>
              <DatePicker
                id={name}
                value={value || ""}
                onChange={(date) => {
                  onChange(date?.isValid ? date?.format("DD.MM.YYYY") : "")
                }}
                placeholder={placeholder}
                format='DD.MM.YYYY'
                className='rmdp-mobile'
                containerClassName='plus-date-calendar'
                inputClass={classNames(
                  "flex-1 text-[15px] font-medium placeholder:text-text-grey text-text-dark leading-[100%] outline-0 bg-transparent py-[14px] px-4",
                  { "pl-[46px]": childrenBefore },
                )}
                weekDays={["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]}
                arrow={false}
                showOtherDays
                mobileLabels={{
                  OK: t("apply"),
                  CANCEL: t("cancel"),
                }}
                maxDate={maxDate}
              ></DatePicker>
            </div>

            {note && !error && (
              <p className='mt-2 text-[14px] font-medium text-text-grey leading-[100%]'>{note}</p>
            )}
            {error && <InputError error={error} />}
          </div>
        </>
      )}
    />
  )
}
