import { type WithTranslation, withTranslation } from "react-i18next"
import IconHeart from "@/shared/assets/icons/icon-heart.svg?react"
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react"
import { ButtonLink } from "@/shared/ui"
import IconMaintenance from "@/shared/assets/icons/icon-maintenance.svg?react"

const MaintenancePageBase = ({ t }: WithTranslation) => {
  return (
    <main className='flex flex-col h-full overflow-auto'>
      <div className='flex-1 flex flex-col items-center justify-center px-6'>
        <div className='mx-auto h-20 w-20 rounded-full bg-icon-gradient flex items-center justify-center mb-4'>
          <IconMaintenance />
        </div>
        <h1 className='title1-bold text-center mb-2'>{t("maintenance.title")}</h1>
        <p className='body-regular !leading-5 text-center opacity-60 max-w-[300px]'>
          {t("maintenance.description")}
        </p>
      </div>

      <div className='px-4 pb-safe-area-bottom'>
        <ButtonLink
          to='https://t.me/PlusDateNews'
          icon={<IconHeart />}
          rightElement={<ChevronIcon />}
        >
          {t("news")}
        </ButtonLink>
      </div>
    </main>
  )
}

export const MaintenancePage = withTranslation()(MaintenancePageBase)
