import { type WithTranslation, withTranslation, useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ProfileEditSchema, type TProfileEdit } from "../model/schemas.ts"
import {
  InputField,
  TextareaField,
  SwitcherField,
  SelectorLink,
  Carousel,
  BottomButton,
} from "@/shared/ui"
import { PageLayout } from "@/widgets"
import IconInstagram from "@/shared/assets/icons/icon-instagram.svg"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { getAdditionalInfoLinks, getMainInfoLinks, hasValueChanged } from "../lib"
import { SwiperSlide } from "swiper/react"
import { UserProfilePhoto, UserProfileVideo } from "@/entities/user/ui"
import classNames from "classnames"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware.tsx"
import {
  PROFILE_EDIT_SCROLL_KEY,
  useScrollPositionRestore,
} from "@/shared/lib/useScrollPositionRestore.ts"

const ProfileEditPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const { i18n } = useTranslation()
  const { data: user, refetch } = useUser()
  const { mutate } = useUserUpdate()
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const keyboardAwareRef = useKeyboardAware(["TEXTAREA", "INPUT"])
  const { saveScroll } = useScrollPositionRestore(PROFILE_EDIT_SCROLL_KEY, keyboardAwareRef)

  const methods = useForm<TProfileEdit>({
    resolver: zodResolver(ProfileEditSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      profile_description: user?.profile_description || "",
      instagram: user?.instagram || "",
      hide_age: user?.settings?.hide_age || false,
    },
  })

  const {
    register,
    control,
    formState: { errors },
    getFieldState,
    getValues,
  } = methods

  const handleSubmitOnBlur = (field: keyof TProfileEdit) => {
    setIsKeyboardOpen(false)
    const state = getFieldState(field)
    if (state.invalid) return

    const value = getValues(field)

    if (!hasValueChanged(field, value, user)) return

    if (!["hide_age"].includes(field)) {
      triggerImpact("medium")
    }
    const data = ["hide_age"].includes(field)
      ? { settings: { [field]: value as boolean } }
      : { [field]: value }
    mutate({
      user_id: user?.id,
      ...data,
    })
  }

  const additionalInfoLinks = useMemo(() => getAdditionalInfoLinks(user, t), [user, t])

  const mainInfoLinks = useMemo(
    () => getMainInfoLinks(user, t, i18n.language),
    [user, t, i18n.language],
  )

  const handleNavigateToPremium = useCallback(() => {
    saveScroll()
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "settings", promotion_name: "settings" }] },
    })
    void navigate("/premium")
  }, [navigate, saveScroll, sendUserEvent])

  const getDisabledClickHandler = useCallback(() => {
    if (user?.is_under_moderation) return () => {}
    if (!user?.is_premium) return handleNavigateToPremium
    return undefined
  }, [user?.is_under_moderation, user?.is_premium, handleNavigateToPremium])

  const video = user?.files?.find((file) => file.type === "video")
  const photos = user?.files?.filter((file) => file.type === "image") || []

  // TODO hack fix, replace later with sockets to update user after changes on admin side
  useEffect(() => {
    void refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!user) return
    if (!user?.is_premium) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: { items: [{ promotion_id: "settings", promotion_name: "settings" }] },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_premium])

  if (!user) return null

  return (
    <PageLayout
      className={classNames("flex flex-col !px-0", { "pb-safe-area-bottom": !isKeyboardOpen })}
    >
      <div className='flex-1 overflow-y-auto' ref={keyboardAwareRef}>
        <div className='subtitle-medium text-white-70 mb-4 px-4 pt-4'>
          {t("profile.photosVideos")}
        </div>

        <Carousel
          enablePagination={false}
          slidesPerView='auto'
          spaceBetween={8}
          className='!h-[275px] !px-4'
        >
          {photos.map((item, index) => (
            <SwiperSlide key={index} className='!w-[170px]'>
              <UserProfilePhoto {...item} allowEdit={!user?.is_under_moderation} />
            </SwiperSlide>
          ))}
          <SwiperSlide className='!w-[170px]'>
            <UserProfileVideo video={video} allowEdit={!user?.is_under_moderation} />
          </SwiperSlide>
        </Carousel>

        <form noValidate className='px-4'>
          <InputField<TProfileEdit>
            name='name'
            register={register}
            error={errors.name}
            label={t("name")}
            placeholder={t("name")}
            onBlurCapture={() => handleSubmitOnBlur("name")}
            disabled={user?.is_under_moderation}
            className='mt-4'
            onFocus={() => setIsKeyboardOpen(true)}
          />

          <TextareaField<TProfileEdit>
            name='profile_description'
            register={register}
            error={errors.profile_description}
            label={t("interests.descriptionLabel")}
            placeholder={t("interests.descriptionLabel")}
            disabled={user?.is_under_moderation}
            className='mt-4'
            onBlurCapture={() => handleSubmitOnBlur("profile_description")}
            onFocus={() => setIsKeyboardOpen(true)}
          />

          <InputField<TProfileEdit>
            name='instagram'
            register={register}
            error={errors.instagram}
            disabled={user?.is_under_moderation}
            placeholder={t("onboarding.basic.instagramName")}
            className='[&>*>input]:pl-[157px] mt-2'
            onBlurCapture={() => handleSubmitOnBlur("instagram")}
            onFocus={() => setIsKeyboardOpen(true)}
            childrenBefore={
              <div className='flex gap-2 items-center'>
                <img src={IconInstagram} alt='' height={24} width={24} />
                <span className='body-regular'>instagram.com/</span>
              </div>
            }
          />

          <div className='subtitle-medium text-white-70 mt-4'>{t("profile.mainInformation")}</div>

          <div onClick={saveScroll} className='mt-2'>
            <SelectorLink
              to='/profile/edit/age'
              label={t("profile.age")}
              value={user.feed_profile?.age ? `${user.feed_profile.age}` : t("profile.choose")}
            />
          </div>

          <SwitcherField<TProfileEdit>
            name='hide_age'
            control={control}
            label={t("profile.hideAge")}
            className='mt-2'
            disabled={!user?.is_premium || user?.is_under_moderation}
            onDisabledClick={getDisabledClickHandler()}
            onChange={() => handleSubmitOnBlur("hide_age")}
          />

          {mainInfoLinks.map((link) => (
            <div key={link.to} onClick={saveScroll}>
              <SelectorLink
                to={link.to}
                label={link.label}
                value={link.value}
                className={link.className}
                showIndicator={link.showIndicator}
              />
            </div>
          ))}

          <div className='subtitle-medium text-white-70 mt-4'>
            {t("profile.additionalInformation")}
          </div>

          {additionalInfoLinks.map((link) => (
            <div key={link.to} onClick={saveScroll}>
              <SelectorLink
                icon={link.img}
                to={link.to}
                label={link.label}
                value={link.value}
                className={link.className}
                showIndicator={link.showIndicator}
              />
            </div>
          ))}
        </form>
      </div>
      {isKeyboardOpen && (
        <BottomButton>
          <span className='button-main'>{t("save")}</span>
        </BottomButton>
      )}
    </PageLayout>
  )
}

export const ProfileEditPage = withTranslation()(ProfileEditPageBase)
