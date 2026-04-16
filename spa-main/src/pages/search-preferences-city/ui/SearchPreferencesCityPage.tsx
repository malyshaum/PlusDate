import { BottomButton } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useState } from "react"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"

import { CitySelect } from "@/shared/ui/CitySelect/CitySelect.tsx"
import type { ICity } from "@/entities/dictionary/model/types.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const SearchPreferencesCityPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [city, setCity] = useState<ICity | undefined>(() => {
    return user?.search_preference?.city || undefined
  })

  const { mutate, isPending } = useUserUpdatePreferences({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: ICity) => {
    setCity(value)
  }

  const handleSubmit = () => {
    triggerImpact()
    if (!city || !user?.search_preference) return
    mutate({
      city_id: city.id,
    })
  }

  return (
    <PageLayout className='!px-0'>
      <div className='h-full flex-1 flex flex-col'>
        <div className='px-4 flex-1 h-full overflow-hidden'>
          <h1 className='title1-bold'>{t("searchPreferences.city")}</h1>
          <div className='h-full flex-1 flex flex-col justify-center overflow-hidden py-4'>
            <CitySelect value={city} onChange={handleChange} />
          </div>
        </div>
        <BottomButton
          onClick={handleSubmit}
          disabled={!city || isPending || city.id === user?.search_preference?.city?.id}
          isLoading={isPending}
        >
          <span className='button-main'>{t("save")}</span>
        </BottomButton>
      </div>
    </PageLayout>
  )
}

export const SearchPreferencesCityPage = withTranslation()(SearchPreferencesCityPageBase)
