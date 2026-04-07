import { BottomButton } from "@/shared/ui"
import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { useState } from "react"
import { useUser, useUserUpdate } from "@/entities/user/api/queries.ts"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { Selector } from "@/shared/ui/Selector/Selector.tsx"
import { searchForOptions } from "@/shared/const/units.ts"

const ProfileEditSearchBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [searchFor, setSearchFor] = useState<string | undefined>(user?.feed_profile?.search_for)

  const { mutate, isPending } = useUserUpdate({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const handleSearchFor = (value: string) => {
    setSearchFor(value)
  }

  const handleSubmit = () => {
    triggerImpact()
    mutate({
      user_id: user?.id,
      search_for: searchFor,
    })
  }

  return (
    <PageLayout className='pb-safe-area-bottom-with-button'>
      <h1 className='title1-bold mb-4'>{t("interests.searchForQuestion")}</h1>
      <Selector
        value={searchFor}
        options={searchForOptions(t)}
        onChange={handleSearchFor}
        direction={"column"}
      />
      <BottomButton
        onClick={handleSubmit}
        disabled={
          !searchFor ||
          isPending ||
          user?.is_under_moderation ||
          searchFor === user?.feed_profile?.search_for
        }
        isLoading={isPending}
      >
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const ProfileEditSearchPage = withTranslation()(ProfileEditSearchBase)
