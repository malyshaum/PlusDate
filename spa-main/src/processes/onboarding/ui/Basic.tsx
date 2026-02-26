import { type WithTranslation, withTranslation } from "react-i18next"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

import { BasicInfoSchema, type TBasicInfo } from "../model/schemas.ts"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"
import { BottomButton, InputField, SelectorField } from "@/shared/ui"
import IconInstagram from "@/shared/assets/icons/icon-instagram.svg"
import IconMale from "@/shared/assets/icons/icon-male.svg?react"
import IconFemale from "@/shared/assets/icons/icon-female.svg?react"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { useUser } from "@/entities/user/api/queries.ts"
import { isValidName } from "@/shared/lib/validateName.ts"

const BasicBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const { basicInfo, setBasicInfo, isKeyboardOpen, setIsKeyboardOpen } = useOnboardingStore()
  const { triggerImpact } = useHapticFeedback()
  const { data: user } = useUser()
  const sendUserEvent = useUserGTMEvent()

  useStep(1)

  const methods = useForm<TBasicInfo>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onTouched",
    defaultValues: {
      ...basicInfo,
      name: user?.name && isValidName(user.name) ? user.name : basicInfo.name,
    },
  })

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isValid },
  } = methods

  const onSubmit: SubmitHandler<TBasicInfo> = async (data) => {
    if (isKeyboardOpen) {
      setIsKeyboardOpen(false)
      return
    }
    sendUserEvent({ event: "gender_selected", gender: data.sex })
    setBasicInfo(data)
    triggerImpact()
    await navigate("years")
  }

  return (
    <>
      <h1 className='title1-bold px-4'>{t("onboarding.basic.title")}</h1>
      <form
        className='mt-4 flex-1 h-full flex flex-col justify-center pb-safe-area-bottom-with-button'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className='flex-1 flex flex-col justify-center px-4'>
          <InputField<TBasicInfo>
            name='name'
            register={register}
            error={errors.name}
            placeholder={t("name")}
            onFocus={() => setIsKeyboardOpen(true)}
            onBlurCapture={() => {
              setTimeout(() => setIsKeyboardOpen(false), 100)
            }}
          />
          <InputField<TBasicInfo>
            name='instagram'
            register={register}
            error={errors.instagram}
            placeholder={t("onboarding.basic.instagramName")}
            className='mt-2 [&>*>input]:pl-[157px]'
            childrenBefore={
              <div className='flex gap-2 items-center'>
                <img src={IconInstagram} alt='' height={24} width={24} />
                <span className='body-regular'>instagram.com/</span>
              </div>
            }
            note={t("onboarding.basic.instagramNote")}
            onFocus={() => setIsKeyboardOpen(true)}
            onBlurCapture={() => {
              setTimeout(() => setIsKeyboardOpen(false), 100)
            }}
          />
          <SelectorField<TBasicInfo>
            name='sex'
            label={t("sex")}
            options={[
              { label: t("male"), value: "male", icon: IconMale },
              { label: t("female"), value: "female", icon: IconFemale },
            ]}
            control={control}
            error={errors.sex}
            className='mt-6'
          />
        </div>
        <BottomButton type='submit' disabled={!isValid}>
          <span className='button-main'>{t("continue")}</span>
        </BottomButton>
      </form>
    </>
  )
}

export const Basic = withTranslation()(BasicBase)
