import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { getEyeColors } from "@/shared/const/units.ts"
import { CustomWheelPicker } from "@/shared/ui/WheelPicker/WheelPicker.tsx"
import { PageLayout } from "@/widgets"
import { BottomButton } from "@/shared/ui"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const ProfileEditEyeBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [eye, setEye] = useState<string>(user?.feed_profile?.eye_color || getEyeColors(t)[0].value)

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleChange = (value: string) => {
    setEye(value)
  }

  const handleSubmit = () => {
    triggerImpact()
    mutate({
      user_id: user?.id,
      eye_color: eye,
    })
  }

  return (
    <PageLayout className='pb-safe-area-bottom-with-button !overflow-hidden'>
      <h1 className='title1-bold'>{t("eye.question")}</h1>
      <div className='h-full flex-1 flex flex-col justify-center overflow-hidden'>
        <CustomWheelPicker
          value={eye || "green"}
          onChange={handleChange}
          options={getEyeColors(t)}
        />
      </div>
      <BottomButton
        onClick={handleSubmit}
        disabled={!eye || isPending || user?.is_under_moderation}
        isLoading={isPending}
      >
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const ProfileEditEyePage = withTranslation()(ProfileEditEyeBase)
