import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { years } from "@/shared/const/units.ts"
import { CustomWheelPicker } from "@/shared/ui/WheelPicker/WheelPicker.tsx"
import { PageLayout } from "@/widgets"
import { BottomButton } from "@/shared/ui"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const ProfileEditAgeBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [age, setAge] = useState<string>(user?.feed_profile?.age?.toString() || "")

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: string) => {
    setAge(value)
  }

  const handleSubmit = () => {
    triggerImpact()
    mutate({
      user_id: user?.id,
      age: Number(age),
    })
  }

  return (
    <PageLayout className='pb-safe-area-bottom-with-button !overflow-hidden'>
      <h1 className='title1-bold'>{t("age.question")}</h1>
      <div className='h-full flex-1 flex flex-col justify-center overflow-hidden'>
        <CustomWheelPicker value={age || "34"} onChange={handleChange} options={years} />
      </div>
      <BottomButton
        onClick={handleSubmit}
        disabled={!age || isPending || user?.is_under_moderation}
        isLoading={isPending}
      >
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const ProfileEditAgePage = withTranslation()(ProfileEditAgeBase)
