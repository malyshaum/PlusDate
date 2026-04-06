import { BottomButton, Checkbox } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useState } from "react"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useHobbies } from "@/entities/dictionary/api/queries.ts"

const ProfileEditInterestsBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [hobbies, setHobbies] = useState<number[]>(
    user?.feed_profile?.hobbies?.map((h) => h.id) || [],
  )

  const { data } = useHobbies(t)

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: (number | string)[]) => {
    setHobbies(value.filter((v): v is number => typeof v === "number"))
  }

  const handleSubmit = () => {
    triggerImpact()
    mutate({
      user_id: user?.id,
      hobbies: hobbies,
    })
  }

  return (
    <PageLayout className='flex flex-col !overflow-hidden'>
      <h1 className='title1-bold mb-4'>{t("interests.title")}</h1>
      <Checkbox
        name='hobbies'
        subLabel={t("interests.hobbiesSubLabel")}
        options={data ?? []}
        className='relative flex flex-col flex-1 overflow-hidden'
        maxSelections={5}
        onChange={handleChange}
        currentSelections={hobbies}
      />
      <BottomButton
        onClick={handleSubmit}
        disabled={user?.is_under_moderation}
        isLoading={isPending}
      >
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const ProfileEditInterestsPage = withTranslation()(ProfileEditInterestsBase)
