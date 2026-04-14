import { useTranslation, withTranslation, type WithTranslation } from "react-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { debounce } from "lodash"

import { PageLayout, PremiumIconAnimation } from "@/widgets"
import { useUser, useUserUpdatePreferences } from "@/entities/user/api/queries.ts"
import { RangeSlider, SelectorLink, Switcher } from "@/shared/ui"
import { Selector } from "@/shared/ui/Selector/Selector.tsx"
import IconMale from "@/shared/assets/icons/icon-male.svg?react"
import IconFemale from "@/shared/assets/icons/icon-female.svg?react"
import IconActivity from "@/shared/assets/icons/icon-activity-white.svg"
import IconEye from "@/shared/assets/icons/icon-eye-white.svg"
import IconLightining from "@/shared/assets/icons/icon-lightining.svg"
import { useUserLocation } from "@/entities/dictionary/hooks/useUserLocation.tsx"
import { getCityName } from "@/shared/lib/userHelpers.ts"
import { searchForOptions } from "@/shared/const/units.ts"
import { useNavigate } from "react-router-dom"
import { useResetPreferences } from "@/entities/user/lib/useResetPreferences.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { useUserLocation as useUserLocationQuery } from "@/entities/dictionary/api/queries.ts"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import type { ESex } from "@/shared/types/common.ts"
import type { IUserSearchFor } from "@/entities/user/model/types.ts"
import { useAppliedFiltersCount } from "@/entities/user/lib/useAppliedFiltersCount"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware"
import {
  SEARCH_PREFERENCES_SCROLL_KEY,
  useScrollPositionRestore,
} from "@/shared/lib/useScrollPositionRestore"

const SearchPreferencesPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const { data: user } = useUser()
  const { mutate } = useUserUpdatePreferences()
  const { handleResetFilters } = useResetPreferences()
  const { getCurrentLocation, position } = useUserLocation()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const sendUserEvent = useUserGTMEvent()
  const filtersCount = useAppliedFiltersCount(user)
  const keyboardAwareRef = useKeyboardAware(["TEXTAREA", "INPUT"])
  const { saveScroll } = useScrollPositionRestore(SEARCH_PREFERENCES_SCROLL_KEY, keyboardAwareRef)

  const { data: nearestCities } = useUserLocationQuery(
    {
      latitude: position?.coords.latitude ?? 0,
      longitude: position?.coords.longitude ?? 0,
    },
    {
      enabled: !!position,
    },
  )

  const [localFromAge, setLocalFromAge] = useState<number | null>(null)
  const [localToAge, setLocalToAge] = useState<number | null>(null)
  const [localFromHeight, setLocalFromHeight] = useState<number | null>(null)
  const [localToHeight, setLocalToHeight] = useState<number | null>(null)
  const [localGender, setLocalGender] = useState<string | null>(null)
  const [localSearchFor, setLocalSearchFor] = useState<string | null>(null)

  const currentFromAge = localFromAge ?? user?.search_preference?.from_age ?? 18
  const currentToAge = Math.min(localToAge ?? user?.search_preference?.to_age ?? 60, 60)
  const currentFromHeight = localFromHeight ?? user?.search_preference?.height_from ?? 100
  const currentToHeight = localToHeight ?? user?.search_preference?.height_to ?? 220
  const currentGender = localGender ?? user?.search_preference?.gender
  const currentSearchFor = localSearchFor ?? user?.search_preference?.search_for

  useEffect(() => {
    if (user?.search_preference) {
      setLocalFromAge(null)
      setLocalToAge(null)
      setLocalFromHeight(null)
      setLocalToHeight(null)
      setLocalGender(null)
      setLocalSearchFor(null)
    }
  }, [user?.search_preference])

  const handleFieldUpdate = (field: string, value: string | boolean | number) => {
    if (!user?.id || !user.search_preference) return

    mutate({ [field]: value })
  }

  const debouncedAgeUpdate = useMemo(
    () =>
      debounce((fromAge: number, toAge: number) => {
        if (!user?.id) return
        mutate({
          from_age: fromAge,
          to_age: toAge,
        })
      }, 500),
    [user?.id, mutate],
  )

  const debouncedHeightUpdate = useMemo(
    () =>
      debounce((fromHeight: number, toHeight: number) => {
        if (!user?.id) return
        mutate({
          height_from: fromHeight,
          height_to: toHeight,
        })
      }, 500),
    [user?.id, mutate],
  )

  const debouncedGenderUpdate = useMemo(
    () =>
      debounce((value: ESex) => {
        if (!user?.id) return

        mutate({ gender: value })
      }, 500),
    [user?.id, mutate],
  )

  const debouncedSearchForUpdate = useMemo(
    () =>
      debounce((value: IUserSearchFor) => {
        if (!user?.id) return

        mutate({ search_for: value })
      }, 500),
    [user?.id, mutate],
  )

  const handleGenderChange = (value: string) => {
    setLocalGender(value)
    debouncedGenderUpdate(value as ESex)
  }

  const handleSearchForChange = (value: string) => {
    setLocalSearchFor(value)
    debouncedSearchForUpdate(value as IUserSearchFor)
  }

  const handleWithPremiumChange = (value: boolean) => {
    handleFieldUpdate("with_premium", value)
  }
  const handleWithVideoChange = (value: boolean) => {
    handleFieldUpdate("with_video", value)
  }

  const handleAgeRangeChange = (ages: [number, number]) => {
    setLocalFromAge(ages[0])
    setLocalToAge(ages[1])
    triggerImpact()
    debouncedAgeUpdate(ages[0], ages[1])
  }

  const handleHeightRangeChange = (heights: [number, number]) => {
    setLocalFromHeight(heights[0])
    setLocalToHeight(heights[1])
    triggerImpact()
    debouncedHeightUpdate(heights[0], heights[1])
  }

  const handleNavigateToPremium = useCallback(() => {
    sendUserEvent({
      event: "select_promotion",
      ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
    })
    void navigate("/premium?sourceFeature=filters")
  }, [navigate, sendUserEvent])

  useEffect(() => {
    void getCurrentLocation()
  }, [getCurrentLocation])

  const nearestCity = nearestCities?.length ? nearestCities[0] : undefined

  const handleCityChange = () => {
    triggerImpact()
    if (nearestCity?.id) {
      handleFieldUpdate("city_id", nearestCity.id)
    }
  }

  useEffect(() => {
    if (!user) return
    if (!user?.is_premium) {
      sendUserEvent({
        event: "view_promotion",
        ecommerce: { items: [{ promotion_id: "other", promotion_name: "other" }] },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_premium])

  if (!user) return null

  return (
    <PageLayout ref={keyboardAwareRef} className='pb-safe-area-bottom'>
      <div className='flex justify-between items-center'>
        <h1 className='title1-bold mb-4'>{t("filters")}</h1>
        <button
          className='flex gap-1 mb-4 body-regular items-center button-main'
          onClick={handleResetFilters}
        >
          <span className='lowercase first-letter:uppercase text-white-70'>
            {t("reset")} ({filtersCount})
          </span>
        </button>
      </div>

      <div>
        <Selector
          name='gender'
          label={t("sex")}
          options={[
            { label: t("male"), value: "male", icon: IconMale },
            { label: t("female"), value: "female", icon: IconFemale },
          ]}
          value={currentGender as unknown as string}
          onChange={handleGenderChange}
          className='mb-4'
        />

        <Selector
          value={currentSearchFor}
          options={searchForOptions(t)}
          label={t("interests.searchFor")}
          onChange={handleSearchForChange}
          direction={"column"}
          className='mb-4'
        />

        <div>
          <div className='mb-3' onClick={saveScroll}>
            <SelectorLink
              to='/preferences/city'
              label={t("profile.yourCity")}
              value={
                user?.search_preference?.city
                  ? getCityName(user.search_preference.city, i18n.language)
                  : t("profile.choose")
              }
            />
          </div>

          {nearestCity && (
            <button className='body-regular mb-7' onClick={handleCityChange}>
              {t("searchPreferences.currentLocation")} -{" "}
              <span className='text-accent'>{getCityName(nearestCity, i18n.language)}</span>
            </button>
          )}

          <div className='h-[1px] bg-white-10 mb-4' />

          <div className='flex items-center gap-2 mb-2'>
            <PremiumIconAnimation />
            {/*background: linear-gradient(89.03deg, #769DE5 -22.22%, #DB46BF 44.03%, #F5558F 136.59%);*/}

            <span className='uppercase bg-[linear-gradient(89.03deg,#769DE5_-22.22%,#DB46BF_44.03%,#F5558F_136.59%)] bg-clip-text text-transparent'>
              {t("premiumFilters")}
            </span>
          </div>

          <Switcher
            value={user.search_preference?.with_video}
            onChange={handleWithVideoChange}
            disabled={!user?.is_premium}
            onDisabledClick={handleNavigateToPremium}
            label={t("searchPreferences.withVideo")}
            className='mb-4 text-white-50'
          />

          <Switcher
            value={user.search_preference?.with_premium}
            onChange={handleWithPremiumChange}
            disabled={!user?.is_premium}
            onDisabledClick={handleNavigateToPremium}
            label={t("searchPreferences.withPremium")}
            className='mb-4 text-white-50'
          />

          <div className='h-[1px] bg-white-10 mb-4' />

          <RangeSlider
            label={t("searchPreferences.ageRange")}
            min={18}
            max={60}
            value={[currentFromAge, currentToAge]}
            onInput={handleAgeRangeChange}
          />

          <div className='h-[1px] bg-white-10 mb-4' />

          <RangeSlider
            label={t("searchPreferences.heightRange")}
            min={100}
            max={220}
            value={[currentFromHeight, currentToHeight]}
            onInput={handleHeightRangeChange}
          />

          <div className='h-[1px] bg-white-10 mb-4' />

          <div className='mt-2' onClick={saveScroll}>
            <SelectorLink
              to='/preferences/activity'
              label={t("profile.industry")}
              value={
                user?.search_preference?.activities?.length
                  ? `${user.search_preference.activities.length} ${t("profile.chosen")}`
                  : t("profile.choose")
              }
              icon={IconActivity}
            />
          </div>
          <div className='mt-2' onClick={saveScroll}>
            <SelectorLink
              to='/preferences/eye-color'
              label={t("profile.eyeColor")}
              value={
                user?.search_preference?.eye_color?.length
                  ? `${user.search_preference.eye_color.length} ${t("profile.chosen")}`
                  : t("profile.choose")
              }
              icon={IconEye}
            />
          </div>

          <div className='mt-2' onClick={saveScroll}>
            <SelectorLink
              to='/preferences/interests'
              label={t("interests.title")}
              value={
                user?.search_preference?.hobbies?.length
                  ? `${user.search_preference.hobbies.length} ${t("profile.chosen")}`
                  : t("profile.choose")
              }
              icon={IconLightining}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export const SearchPreferencesPage = withTranslation()(SearchPreferencesPageBase)
