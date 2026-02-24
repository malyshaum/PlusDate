import { Button } from "@/shared/ui"
import { useNavigate } from "react-router-dom"
import { useResetPreferences } from "@/entities/user/lib/useResetPreferences.ts"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export const EmptyProfilesStateBase = ({ t }: WithTranslation) => {
  const navigate = useNavigate()
  const { triggerImpact } = useHapticFeedback()
  const { handleResetFilters } = useResetPreferences()

  const navigateToPreferences = () => {
    triggerImpact()
    void navigate("/preferences")
  }

  return (
    <div className='flex items-center flex-col justify-center h-full'>
      <div className='text-center mb-4'>
        <p className='title1-bold mb-1'>{t("swipe.emptyProfiles.title")}</p>
        <p className='caption1-medium text-white-50'>{t("swipe.emptyProfiles.subtitle")}</p>
      </div>
      <Button size='L' className='mb-2' onClick={handleResetFilters}>
        {t("swipe.emptyProfiles.resetFilters")}
      </Button>
      <Button size='L' appearance='white' onClick={navigateToPreferences}>
        {t("swipe.emptyProfiles.changeFilters")}
      </Button>
    </div>
  )
}

export const EmptyProfilesState = withTranslation()(EmptyProfilesStateBase)
