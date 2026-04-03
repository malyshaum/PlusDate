import { BottomButton } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useState } from "react"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"

import { CitySelect } from "@/shared/ui/CitySelect/CitySelect.tsx"
import type { ICity } from "@/entities/dictionary/model/types.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const ProfileEditCityBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [city, setCity] = useState<ICity | undefined>(user?.feed_profile?.city)

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: ICity) => {
    setCity(value)
  }

  const handleSubmit = () => {
    if (!city) return
    triggerImpact()
    mutate({
      user_id: user?.id,
      city_id: city.id,
    })
  }

  return (
    <PageLayout className='!px-0'>
      <div className='h-full flex-1 flex flex-col'>
        <div className='px-4 flex-1 h-full overflow-hidden'>
          <h1 className='title1-bold'>{t("onboarding.city.title")}</h1>
          <div className='h-full flex-1 flex flex-col justify-center overflow-hidden py-4'>
            <CitySelect value={city} onChange={handleChange} />
          </div>
        </div>
        <BottomButton
          onClick={handleSubmit}
          disabled={
            !city ||
            isPending ||
            city.id === user?.feed_profile?.city.id ||
            user?.is_under_moderation
          }
          isLoading={isPending}
        >
          <span className='button-main'>{t("save")}</span>
        </BottomButton>
      </div>
    </PageLayout>
  )
}

export const ProfileEditCityPage = withTranslation()(ProfileEditCityBase)
