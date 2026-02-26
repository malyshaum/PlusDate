import { type WithTranslation, withTranslation } from "react-i18next"
import { type SubmitHandler, useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

import { CityInfoSchema, type TCityInfo } from "../model/schemas.ts"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"
import { BottomButton } from "@/shared/ui"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { CitySelectField } from "@/shared/ui/CitySelect/CitySelectField.tsx"
import { useUserLocation } from "@/entities/dictionary/hooks/useUserLocation.tsx"
import { useUserLocation as useUserLocationQuery } from "@/entities/dictionary/api/queries.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

const CityBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const { cityInfo, setCityInfo, isKeyboardOpen, setIsKeyboardOpen } = useOnboardingStore()
  const { triggerImpact } = useHapticFeedback()
  const { position, getCurrentLocation } = useUserLocation()
  const sendUserEvent = useUserGTMEvent()

  useStep(3)

  const { data: cities } = useUserLocationQuery(
    {
      latitude: position?.coords.latitude ?? 0,
      longitude: position?.coords.longitude ?? 0,
    },
    {
      enabled: !!position,
    },
  )

  const methods = useForm<TCityInfo>({
    resolver: zodResolver(CityInfoSchema),
    mode: "onTouched",
    defaultValues: cityInfo,
  })

  const {
    handleSubmit,
    setValue,
    trigger,
    formState: { isValid },
  } = methods

  useEffect(() => {
    if (!cityInfo?.city_id) {
      void getCurrentLocation()
    }
  }, [getCurrentLocation, cityInfo?.city_id])

  useEffect(() => {
    const city = cities?.length ? cities[0] : undefined
    if (city) {
      setValue("city_id", city.id)
      setValue("en_country_name", city.en_country_name)
      setValue("en_name", city.en_name)
      setValue("ru_country_name", city.ru_country_name)
      setValue("ru_name", city.ru_name)
      void trigger()
    }
  }, [cities, setValue, trigger])

  const onSubmit: SubmitHandler<TCityInfo> = async (data) => {
    if (isKeyboardOpen) {
      setIsKeyboardOpen(false)
      return
    }

    setCityInfo(data)
    triggerImpact()

    sendUserEvent({ event: "city_selected", city: data.en_name })

    await navigate("/onboarding/interests")
  }

  return (
    <>
      <h1 className='title1-bold px-4'>{t("onboarding.city.title")}</h1>
      <FormProvider {...methods}>
        <form
          className='mt-4 flex-1 flex flex-col h-full overflow-hidden'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className='flex-1 h-full overflow-hidden px-4'>
            <CitySelectField
              onInputFocus={() => setIsKeyboardOpen(true)}
              onInputBlur={() => {
                setTimeout(() => setIsKeyboardOpen(false), 100)
              }}
            />
          </div>

          <BottomButton type='submit' disabled={!isValid}>
            <span className='button-main'>{t("continue")}</span>
          </BottomButton>
        </form>
      </FormProvider>
    </>
  )
}

export const City = withTranslation()(CityBase)
