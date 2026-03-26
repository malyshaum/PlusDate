import { type WithTranslation, withTranslation } from "react-i18next"
import { ButtonLink, BottomButton } from "@/shared/ui"
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react"
import IconHeart from "@/shared/assets/icons/icon-heart.svg?react"
import IconRestricted from "@/shared/assets/icons/icon-restricted.svg?react"
import { useUser } from "@/entities/user/api/queries"

const ModerationRestrictedBase = ({ t }: WithTranslation) => {
  const { data } = useUser()
  return (
    <main className='flex flex-col h-full overflow-auto'>
      <div className='flex-1 flex flex-col items-center justify-center px-6'>
        <IconRestricted width={110} height={110} />

        <h1 className='title1-bold text-center mb-3'>{t("moderationRestricted.title")}</h1>
        <p className='body-regular !leading-5 text-center opacity-60 max-w-[300px]'>
          {data?.moderation?.find((el) => +el.rejection_reason === 11)?.note ||
            t("moderationRestricted.description")}
        </p>
      </div>

      <div className='px-4 pb-safe-area-bottom flex flex-col h-38'>
        <ButtonLink to='#' icon={<IconHeart />} rightElement={<ChevronIcon />}>
          {t("moderationRestricted.rules")}
        </ButtonLink>

        <BottomButton>
          <a href={"https://t.me/PlusDateSupport"} className='button-main'>
            {t("moderationRestricted.contactSupport")}
          </a>
        </BottomButton>
      </div>
    </main>
  )
}

export const ModerationRestricted = withTranslation()(ModerationRestrictedBase)
