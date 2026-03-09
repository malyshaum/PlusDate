import React, { useRef, useState } from "react"
import { debounce } from "lodash"
import { useTranslation } from "react-i18next"

import { Input, RadioButtonBig } from "@/shared/ui"
import IconSearch from "@/shared/assets/icons/icon-search.svg"
import { useCities } from "@/entities/dictionary/api/queries.ts"
import type { ICity } from "@/entities/dictionary/model/types.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserLocation } from "@/entities/dictionary/hooks/useUserLocation.tsx"
interface Props {
  value?: ICity | null
  onChange: (city: ICity) => void
  onInputFocus?: () => void
  onInputBlur?: () => void
}

export const CitySelect = ({ value, onChange, onInputFocus, onInputBlur }: Props) => {
  const {
    i18n: { resolvedLanguage },
    t,
  } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const { position } = useUserLocation()

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debounced(e.target.value)
  }

  const debounced = useRef(
    debounce((val: string) => {
      setDebouncedSearch(val)
    }, 500),
  ).current

  const { data: cities, isLoading } = useCities(
    debouncedSearch,
    position?.coords
      ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      : undefined,
  )

  const getCityName = (city?: ICity | null, unit?: string) => {
    if (!city || !unit) return ""
    return city[`${resolvedLanguage}_${unit}` as keyof ICity]
  }

  const handleCityPick = (city: ICity) => {
    triggerImpact()
    onChange(city)
  }

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='flex-shrink-0 mb-8'>
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder={t("search")}
          childrenBefore={<img src={IconSearch} alt='icon-search' />}
          onFocus={onInputFocus}
          onBlurCapture={onInputBlur}
        />
      </div>

      {value && (
        <div className='mb-4'>
          <div className='subtitle-medium text-white-70'>{t("yourCity")}</div>
          <RadioButtonBig className='mt-2' isSelected={true}>
            <span className='flex-1'>
              <span className='block body-bold !leading-[19px]'>{getCityName(value, "name")}</span>
              <span className='mt-1 block caption1-medium opacity-[50%] !leading-[17px]'>
                {getCityName(value, "country_name")}
              </span>
            </span>
          </RadioButtonBig>
        </div>
      )}

      <div className='flex-1 overflow-hidden flex flex-col min-h-0'>
        <div className='subtitle-medium text-white-70 mb-2 flex-shrink-0'>{t("cities")}</div>
        <div className='overflow-auto pb-safe-area-bottom-with-button flex-1'>
          {isLoading ? (
            <div className='mx-auto mt-4 loader'></div>
          ) : (
            cities?.map((c) => {
              return (
                <RadioButtonBig key={c.id} onClick={() => void handleCityPick(c)}>
                  <span className='flex-1'>
                    <span className='block body-bold !leading-[19px]'>
                      {getCityName(c, "name")}
                    </span>
                    <span className='mt-1 block caption1-medium !leading-[17px] opacity-[50%]'>
                      {getCityName(c, "country_name")}
                    </span>
                  </span>
                </RadioButtonBig>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
