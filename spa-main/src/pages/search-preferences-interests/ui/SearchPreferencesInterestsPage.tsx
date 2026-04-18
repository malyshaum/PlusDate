import { BottomButton } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useState } from "react"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { Checkbox } from "@/shared/ui/Checkbox/Checkbox.tsx"
import { useHobbies } from "@/entities/dictionary/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const SearchPreferencesInterestsPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [hobbies, setHobbies] = useState<number[]>(user?.search_preference?.hobbies || [])

  const { data } = useHobbies(t)

  const { mutate, isPending } = useUserUpdatePreferences({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: (number | string)[]) => {
    setHobbies(value.filter((v): v is number => typeof v === "number"))
  }

  const handleSubmit = () => {
    if (!user?.search_preference) return
    triggerImpact()
    mutate({
      hobbies: hobbies,
    })
  }

  return (
    <PageLayout className='flex flex-col !overflow-hidden'>
      <h1 className='title1-bold mb-4'>{t("searchPreferences.interests")}</h1>
      <Checkbox
        name='hobbies'
        label={t("interests.hobbiesLabel")}
        subLabel={t("searchPreferences.selectInterests")}
        options={data ?? []}
        className='relative flex flex-col flex-1 overflow-hidden'
        onChange={handleChange}
        currentSelections={hobbies}
      />
      <BottomButton onClick={handleSubmit} disabled={isPending} isLoading={isPending}>
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const SearchPreferencesInterestsPage = withTranslation()(SearchPreferencesInterestsPageBase)
