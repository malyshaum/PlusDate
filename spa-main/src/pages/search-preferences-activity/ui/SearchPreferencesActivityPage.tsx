import { type WithTranslation, withTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useState, useMemo } from "react"
import { BottomButton, Checkbox, Input } from "@/shared/ui"
import IconSearch from "@/shared/assets/icons/icon-search.svg"
import { PageLayout } from "@/widgets"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { useActivities } from "@/entities/dictionary/api/queries.ts"
import type { IActivity } from "@/entities/dictionary/model/types.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

const SearchPreferencesActivityPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const { data: user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedActivities, setSelectedActivities] = useState(
    [...(user?.search_preference?.activities || [])].map((el) => ({ id: el.id, title: el.title })),
  )

  const { mutate, isPending } = useUserUpdatePreferences({
    onSuccess: () => {
      void navigate(-1)
    },
  })

  const { data: activities } = useActivities(t)

  const filteredActivities: IActivity[] = useMemo(() => {
    if (!activities) return []
    if (!searchTerm.trim()) return activities

    return activities.filter((activity) =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [activities, searchTerm])

  const handleActivitySelect = (value: (number | string)[]) => {
    const filteredIds = value.filter((v): v is number => typeof v === "number")
    const selectedActivities = activities?.filter((el) => filteredIds.includes(el.id)) || []
    setSelectedActivities(selectedActivities)
  }

  const handleSubmit = () => {
    if (!user?.search_preference) return
    triggerImpact()
    mutate({
      activity_ids: selectedActivities.map((el) => el.id),
    })
  }

  return (
    <PageLayout className='flex flex-col'>
      <h1 className='title1-bold'>{t("searchPreferences.activity")}</h1>
      <div className='pt-4 flex flex-col gap-4 h-full flex-1 overflow-auto'>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("search")}
          childrenBefore={<img src={IconSearch} alt='icon-search' />}
        />

        <Checkbox
          options={filteredActivities.map((el) => ({
            label: el.title,
            value: el.id,
            icon: <img src={`/activities/${el.key}.svg`} alt={el.title} />,
          }))}
          className='relative flex flex-col flex-1 overflow-hidden'
          onChange={handleActivitySelect}
          currentSelections={selectedActivities.map((el) => el.id)}
        />
      </div>
      <BottomButton onClick={handleSubmit} disabled={isPending} isLoading={isPending}>
        <span className='button-main'>{t("save")}</span>
      </BottomButton>
    </PageLayout>
  )
}

export const SearchPreferencesActivityPage = withTranslation()(SearchPreferencesActivityPageBase)
