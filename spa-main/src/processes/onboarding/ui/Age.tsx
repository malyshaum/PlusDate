import { type WithTranslation, withTranslation } from "react-i18next"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

import { type TAgeInfo, AgeInfoSchema } from "../model/schemas.ts"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"
import { BottomButton } from "@/shared/ui"
import { years } from "@/shared/const/units.ts"
import { WheelPickerField } from "@/shared/ui/WheelPicker/WheelPickerField.tsx"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

const AgeBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const { ageInfo, setAgeInfo } = useOnboardingStore()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()
  useStep(2)

  const methods = useForm<TAgeInfo>({
    resolver: zodResolver(AgeInfoSchema),
    mode: "onTouched",
    defaultValues: ageInfo,
  })

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = methods

  const onSubmit: SubmitHandler<TAgeInfo> = async (data) => {
    sendUserEvent({ event: "age_selected", age: data.age })
    setAgeInfo(data)
    triggerImpact()
    await navigate("/onboarding/city")
  }

  return (
    <>
      <h1 className='title1-bold px-4'>{t("onboarding.year.title")}</h1>
      <form
        className='h-full flex-1 flex flex-col overflow-hidden pb-safe-area-bottom-with-button'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className='flex-1 flex items-center justify-center'>
          <WheelPickerField<TAgeInfo> name='age' control={control} options={years} />
        </div>

        <BottomButton type='submit' disabled={!isValid} className='pb-safe-area-bottom'>
          <span className='button-main'>{t("continue")}</span>
        </BottomButton>
      </form>
    </>
  )
}

export const Age = withTranslation()(AgeBase)
