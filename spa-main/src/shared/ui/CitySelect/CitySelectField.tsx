import { useMemo } from "react"
import { useFormContext } from "react-hook-form"

import { CitySelect } from "@/shared/ui"
import type { ICity } from "@/entities/dictionary/model/types.ts"

interface Props {
  onInputFocus?: () => void
  onInputBlur?: () => void
}

export const CitySelectField = ({ onInputFocus, onInputBlur }: Props) => {
  const { setValue, watch, trigger, getValues } = useFormContext()
  const currentValue = watch("city_id")

  const selectedCity = useMemo(() => {
    const formValues = getValues()
    if (!currentValue) return null

    return {
      id: formValues.city_id,
      en_name: formValues.en_name,
      en_country_name: formValues.en_country_name,
      ru_name: formValues.ru_name,
      ru_country_name: formValues.ru_country_name,
    } as ICity
  }, [currentValue, getValues])

  const handleCityChange = async (city: ICity) => {
    setValue("city_id", city.id)
    setValue("en_country_name", city.en_country_name)
    setValue("en_name", city.en_name)
    setValue("ru_country_name", city.ru_country_name)
    setValue("ru_name", city.ru_name)
    await trigger()
  }

  return (
    <CitySelect
      value={selectedCity}
      onChange={handleCityChange}
      onInputFocus={onInputFocus}
      onInputBlur={onInputBlur}
    />
  )
}
