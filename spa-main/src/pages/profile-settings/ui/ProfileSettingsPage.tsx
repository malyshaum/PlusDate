import { useTranslation, withTranslation, type WithTranslation } from "react-i18next"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { RadioButtonBig } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { useState } from "react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { Link } from "react-router-dom"
import { getTermsLink, getPrivacyLink } from "@/shared/lib/getLegalLinks"

const ProfileSettingsBase = ({ t }: WithTranslation) => {
  const { data: user } = useUser()
  const { i18n } = useTranslation()
  const { mutate, isPending } = useUserUpdate()
  const [lang, setLang] = useState(user?.language_code || i18n.language)
  const { triggerImpact } = useHapticFeedback()

  const onChangeLang = (val: string) => {
    if (lang === val) return
    triggerImpact()
    setLang(val)
    if (user?.id) {
      mutate({
        user_id: user.id,
        language_code: val,
      })
      void i18n.changeLanguage(val)
    }
  }

  if (!user) return null

  return (
    <PageLayout>
      <div className='subtitle-medium text-white-70 mb-4'>{t("settings.language")}</div>
      <RadioButtonBig
        onClick={() => onChangeLang("en")}
        disabled={isPending}
        isSelected={lang === "en"}
      >
        <span className='flex-1'>
          <span className='block body-bold'>{t("settings.english")}</span>
          <span className='mt-1 block caption1-medium opacity-[50%]'>English</span>
        </span>
      </RadioButtonBig>

      <RadioButtonBig
        onClick={() => onChangeLang("ru")}
        disabled={isPending}
        isSelected={lang === "ru"}
      >
        <span className='flex-1'>
          <span className='block body-bold'>{t("settings.russian")}</span>
          <span className='mt-1 block caption1-medium opacity-[50%]'>Russian</span>
        </span>
      </RadioButtonBig>

      <div className='subtitle-medium text-white-70 mt-4'>{t("settings.other")}</div>
      <div className='mt-2 flex flex-col gap-2'>
        <a
          href={getTermsLink(i18n.language)}
          className='bg-white-10 rounded-[8px] px-4 py-[18px] body-regular text-center'
          target='_blank'
          rel='noreferrer'
        >
          {t("terms")}
        </a>
        <a
          href={getPrivacyLink(i18n.language)}
          className='bg-white-10 rounded-[8px] px-4 py-[18px] body-regular text-center'
          target='_blank'
          rel='noreferrer'
        >
          {t("privacy")}
        </a>
        <a
          href='https://t.me/PlusDateSupport'
          className='bg-white-10 rounded-[8px] px-4 py-[18px] body-regular text-center'
          target='_blank'
          rel='noreferrer'
        >
          {t("support")}
        </a>
        <Link
          to='/profile/delete'
          className='bg-white-10 rounded-[8px] px-4 py-[18px] body-regular text-center text-attention'
        >
          {t("profileDelete.deleteButton")}
        </Link>
      </div>
    </PageLayout>
  )
}

export const ProfileSettingsPage = withTranslation()(ProfileSettingsBase)
