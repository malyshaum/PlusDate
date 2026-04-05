import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { heightsCm } from "@/shared/const/units.ts"
import { CustomWheelPicker } from "@/shared/ui/WheelPicker/WheelPicker.tsx"
import { PageLayout } from "@/widgets"
import { BottomButton } from "@/shared/ui"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"

import { useState } from "react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const ProfileEditHeightBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [height, setHeight] = useState<string>(user?.feed_profile?.height?.toString() || "160")

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleHeightChange = (value: string) => {
    setHeight(value)
  }

  const handleSubmit = () => {
    triggerImpact()
    mutate({
      user_id: user?.id,
      height: Number(height),
    })
  }

  return (
    <PageLayout className='pb-safe-area-bottom-with-button !overflow-hidden'>
      <h1 className='title1-bold'>{t("height.question")}</h1>
      <div className='h-full flex-1 flex flex-col justify-center overflow-hidden'>
        <CustomWheelPicker value={height} onChange={handleHeightChange} options={heightsCm} />
      </div>
      <BottomButton
        onClick={handleSubmit}
        disabled={!height || isPending || user?.is_under_moderation}
        isLoading={isPending}
      >
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const ProfileEditHeightPage = withTranslation()(ProfileEditHeightBase)
