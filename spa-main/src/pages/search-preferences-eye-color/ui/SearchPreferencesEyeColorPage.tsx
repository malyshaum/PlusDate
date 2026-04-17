import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { getEyeColors } from "@/shared/const/units.ts"
import { PageLayout } from "@/widgets"
import { BottomButton, Checkbox } from "@/shared/ui"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const SearchPreferencesEyeColorPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [eyeColors, setEyeColors] = useState<string[]>(user?.search_preference?.eye_color || [])

  const { mutate, isPending } = useUserUpdatePreferences({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (values: (number | string)[]) => {
    const eyeColorOptions = getEyeColors(t)
    const selectedColors = values
      .filter((v): v is number => typeof v === "number")
      .map((index) => eyeColorOptions[index]?.value)
      .filter(Boolean)
    setEyeColors(selectedColors)
  }

  const handleSubmit = () => {
    if (!user?.search_preference) return

    triggerImpact()
    mutate({
      eye_color: eyeColors,
    })
  }

  const eyeColorOptions = getEyeColors(t).map((color, index) => ({
    value: index,
    label: color.label,
  }))

  const selectedIndices = eyeColors
    .map((color) => {
      const eyeColorOptions = getEyeColors(t)
      return eyeColorOptions.findIndex((option) => option.value === color)
    })
    .filter((index) => index !== -1)

  return (
    <PageLayout className='!px-0'>
      <div className='h-full flex-1 flex flex-col'>
        <div className='px-4 flex-1 h-full overflow-hidden pb-4'>
          <h1 className='title1-bold'>{t("searchPreferences.eyeColor")}</h1>
          <div className='pt-4 flex flex-col h-full flex-1 overflow-auto'>
            <Checkbox
              name='eye_colors'
              label={t("searchPreferences.selectEyeColors")}
              options={eyeColorOptions}
              className='mt-4 pb-4 relative flex flex-col'
              onChange={handleChange}
              currentSelections={selectedIndices}
            />
          </div>
        </div>
        <BottomButton onClick={handleSubmit} disabled={isPending} isLoading={isPending}>
          <span className='button-main'>{t("save")}</span>
        </BottomButton>
      </div>
    </PageLayout>
  )
}

export const SearchPreferencesEyeColorPage = withTranslation()(SearchPreferencesEyeColorPageBase)
