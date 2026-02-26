import { type WithTranslation, withTranslation } from "react-i18next"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

import { InterestInfoSchema, type TInterests } from "../model/schemas.ts"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"
import { BottomButton, CheckboxField, SelectorField, TextareaField } from "@/shared/ui"
import { useStep } from "@/processes/onboarding/lib/useStep.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware.tsx"
import { useHobbies } from "@/entities/dictionary/api/queries.ts"
import { searchForOptions } from "@/shared/const/units.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

const InterestsBase = ({ t }: WithTranslation) => {
  const keyboardAwareRef = useKeyboardAware()
  const navigate = useNavigate()
  const { interestsInfo, setInterestsInfo, isKeyboardOpen, setIsKeyboardOpen } =
    useOnboardingStore()
  const { triggerImpact } = useHapticFeedback()
  const sendUserEvent = useUserGTMEvent()
  useStep(4)

  const methods = useForm<TInterests>({
    resolver: zodResolver(InterestInfoSchema),
    mode: "onChange",
    defaultValues: {
      search_for: interestsInfo?.search_for,
      profile_description: interestsInfo?.profile_description || "",
      hobbies: interestsInfo?.hobbies || [],
    },
  })

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isValid },
  } = methods

  const { data: hobbies } = useHobbies(t)

  const onSubmit: SubmitHandler<TInterests> = async (data) => {
    if (isKeyboardOpen) {
      setIsKeyboardOpen(false)
      return
    }

    setInterestsInfo({
      ...data,
      profile_description: (data.profile_description ?? "").trim(),
    })
    triggerImpact()
    sendUserEvent({ event: "search_for_selected", search_for: data.search_for })
    await navigate("/onboarding/media")
  }

  return (
    <div ref={keyboardAwareRef} className='flex flex-col h-full overflow-hidden'>
      <h1 className='title1-bold px-4'>{t("interests.title")}</h1>
      <form
        className='mt-4 flex flex-col h-full flex-1 overflow-auto gap-2'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className='overflow-auto flex flex-col h-full px-4'>
          <SelectorField<TInterests>
            name='search_for'
            label={t("interests.searchFor")}
            options={searchForOptions(t)}
            control={control}
            error={errors.search_for}
            direction={"column"}
          />

          <TextareaField<TInterests>
            name='profile_description'
            placeholder={t("onboarding.interests.descriptionPlaceholder")}
            label={t("interests.descriptionLabel")}
            subLabel={t("interests.descriptionSubLabel")}
            register={register}
            error={errors.profile_description}
            className='mt-4'
            onFocus={() => setIsKeyboardOpen(true)}
            onBlurCapture={() => {
              setTimeout(() => setIsKeyboardOpen(false), 100)
            }}
          />

          <CheckboxField<TInterests>
            name='hobbies'
            label={t("interests.hobbiesLabel")}
            subLabel={t("interests.hobbiesSubLabel")}
            control={control}
            options={hobbies ?? []}
            error={errors.hobbies}
            className='mt-4 relative flex flex-col'
            maxSelections={5}
          />
        </div>
        <BottomButton type='submit' disabled={!isValid}>
          <span className='button-main'>{t("continue")}</span>
        </BottomButton>
      </form>
    </div>
  )
}

export const Interests = withTranslation()(InterestsBase)
