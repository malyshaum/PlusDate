import { RouterGuard } from "@/app/router"
import { Route, Routes, Navigate } from "react-router-dom"
import { useEffect } from "react"
import {
  OnboardingPage,
  ModerationPage,
  FeedPage,
  Chats,
  Chat,
  LikesPage,
  MatchesPage,
  ProfileEditCityPage,
  ProfilePage,
  ProfileEditPage,
  ProfileEditHeightPage,
  ProfileEditEyePage,
  ProfileEditAgePage,
  ProfileEditSearchPage,
  ProfileEditInterestsPage,
  ProfileEditActivityPage,
  ProfileSettingsPage,
  PremiumPage,
  ProfileReferralPage,
  SearchPreferencesPage,
  SearchPreferencesCityPage,
  SearchPreferencesActivityPage,
  SearchPreferencesEyeColorPage,
  SearchPreferencesInterestsPage,
  ProfileGuestPage,
  ProfileDeletePage,
  ProfileRestorePage,
  ProfileReportPage,
} from "@/pages"
import { Basic, Interests, Media, Verification, Age, City } from "@/processes/onboarding"
import { Moderation, ModerationSplash } from "@/processes/moderation"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useTelegramBackButtonVisibility } from "@/shared/lib/useTelegramBackButtonVisibility.tsx"
import { withPageTransition } from "@/shared/hoc/withPageTransition"
import { Toast, ReportSuccessModal ,NetworkIndicator} from "@/shared/ui"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { ModerationRestricted } from "@/pages/moderation"

const ProfilePageWithTransition = withPageTransition(ProfilePage, "profile")
const ProfileEditPageWithTransition = withPageTransition(
  ProfileEditPage,
  "profile-edit",
  "slideInOut",
)
const ProfileEditHeightPageWithTransition = withPageTransition(
  ProfileEditHeightPage,
  "profile-edit-height",
  "slideInOut",
)
const ProfileEditEyePageWithTransition = withPageTransition(
  ProfileEditEyePage,
  "profile-edit-eye",
  "slideInOut",
)
const ProfileEditAgePageWithTransition = withPageTransition(
  ProfileEditAgePage,
  "profile-edit-age",
  "slideInOut",
)
const ProfileEditCityPageWithTransition = withPageTransition(
  ProfileEditCityPage,
  "profile-edit-city",
  "slideInOut",
)
const ProfileEditInterestsPageWithTransition = withPageTransition(
  ProfileEditInterestsPage,
  "profile-edit-interests",
  "slideInOut",
)

const ProfileEditSearchPageWithTransition = withPageTransition(
  ProfileEditSearchPage,
  "profile-edit-search",
  "slideInOut",
)

const ProfileEditActivityPageWithTransition = withPageTransition(
  ProfileEditActivityPage,
  "profile-edit-activity",
  "slideInOut",
)
const ProfileSettingsPageWithTransition = withPageTransition(
  ProfileSettingsPage,
  "profile-settings",
  "slideInOut",
)
const ProfileReferralPageWithTransition = withPageTransition(
  ProfileReferralPage,
  "profile-referral",
  "slideInOut",
)
const SearchPreferencesPageWithTransition = withPageTransition(
  SearchPreferencesPage,
  "search-preferences",
  "slideInOut",
)
const SearchPreferencesCityPageWithTransition = withPageTransition(
  SearchPreferencesCityPage,
  "search-preferences-city",
  "slideInOut",
)
const SearchPreferencesActivityPageWithTransition = withPageTransition(
  SearchPreferencesActivityPage,
  "search-preferences-activity",
  "slideInOut",
)
const SearchPreferencesEyeColorPageWithTransition = withPageTransition(
  SearchPreferencesEyeColorPage,
  "search-preferences-eye-color",
  "slideInOut",
)
const SearchPreferencesInterestsPageWithTransition = withPageTransition(
  SearchPreferencesInterestsPage,
  "search-preferences-interests",
  "slideInOut",
)
const LikesPageWithTransition = withPageTransition(LikesPage, "likes")
const MatchesPageWithTransition = withPageTransition(MatchesPage, "matches")
const PremiumPageWithTransition = withPageTransition(PremiumPage, "premium")
const ChatsWithTransition = withPageTransition(Chats, "chats")
const ChatWithTransition = withPageTransition(Chat, "chat", "slideInOut")
const ProfileGuestWithTransition = withPageTransition(ProfileGuestPage, "profile-guest")

const BasicWithTransition = withPageTransition(Basic, "basic")
const AgeWithTransition = withPageTransition(Age, "years", "slideInOut")
const CityWithTransition = withPageTransition(City, "city", "slideInOut")
const InterestsWithTransition = withPageTransition(Interests, "interests", "slideInOut")
const MediaWithTransition = withPageTransition(Media, "media", "slideInOut")
const VerificationWithTransition = withPageTransition(Verification, "verification", "slideInOut")

const ModerationWithTransition = withPageTransition(Moderation, "moderation-basic")
const ModerationSplashWithTransition = withPageTransition(ModerationSplash, "moderation-splash")
const ProfileDeleteWithTransition = withPageTransition(ProfileDeletePage, "profile-delete")
const ProfileRestoreWithTransition = withPageTransition(ProfileRestorePage, "profile-restore")
const ProfileReportWithTransition = withPageTransition(ProfileReportPage, "profile-report", "slideInOut")

function App() {
  const sendUserEvent = useUserGTMEvent()
  useHapticFeedback(true)
  useTelegramBackButtonVisibility([
    "/",
    "/onboarding",
    "/moderation",
    "/moderation-splash",
    "/feed",
    "/profile/restore",
    // "/premium",
  ])

  useEffect(() => {
    const GTM_EVENT_KEY = "gtm_new_user_register_sent"

    const alreadySent = localStorage.getItem(GTM_EVENT_KEY)

    if (!alreadySent) {
      sendUserEvent({ event: "new_user_register" })
      localStorage.setItem(GTM_EVENT_KEY, "true")
    }
  }, [])

  return (
    <>
      <Toast />
      <ReportSuccessModal />
      <NetworkIndicator />
      <Routes>
        <Route path='/*' element={<RouterGuard />}>
          <Route path='onboarding' element={<OnboardingPage />}>
            <Route index element={<BasicWithTransition />} />
            <Route path='years' element={<AgeWithTransition />} />
            <Route path='city' element={<CityWithTransition />} />
            <Route path='interests' element={<InterestsWithTransition />} />
            <Route path='media' element={<MediaWithTransition />} />
            <Route path='verification' element={<VerificationWithTransition />} />
          </Route>

          <Route path='blocked' element={<ModerationRestricted />} />

          <Route path='moderation' element={<ModerationPage />}>
            <Route index element={<ModerationWithTransition />} />
          </Route>

          <Route path='moderation-splash' element={<ModerationSplashWithTransition />} />

          <Route index element={<Navigate to='/feed' replace />} />
          <Route path='feed' element={<FeedPage />} />

          <Route path='profile' element={<ProfilePageWithTransition />} />

          <Route path='profile/delete' element={<ProfileDeleteWithTransition />} />

          <Route path='profile/restore' element={<ProfileRestoreWithTransition />} />

          <Route path='profile/report' element={<ProfileReportWithTransition />} />

          <Route path='profile/edit' element={<ProfileEditPageWithTransition />} />

          <Route path='profile/edit/height' element={<ProfileEditHeightPageWithTransition />} />

          <Route path='profile/edit/eye' element={<ProfileEditEyePageWithTransition />} />

          <Route path='profile/edit/age' element={<ProfileEditAgePageWithTransition />} />

          <Route path='profile/edit/city' element={<ProfileEditCityPageWithTransition />} />

          <Route
            path='profile/edit/interests'
            element={<ProfileEditInterestsPageWithTransition />}
          />

          <Route path='profile/edit/search' element={<ProfileEditSearchPageWithTransition />} />

          <Route path='profile/edit/activity' element={<ProfileEditActivityPageWithTransition />} />

          <Route path='profile/settings' element={<ProfileSettingsPageWithTransition />} />

          <Route path='profile/referral' element={<ProfileReferralPageWithTransition />} />

          <Route path='preferences' element={<SearchPreferencesPageWithTransition />} />

          <Route path='preferences/city' element={<SearchPreferencesCityPageWithTransition />} />

          <Route
            path='preferences/activity'
            element={<SearchPreferencesActivityPageWithTransition />}
          />

          <Route
            path='preferences/eye-color'
            element={<SearchPreferencesEyeColorPageWithTransition />}
          />

          <Route
            path='preferences/interests'
            element={<SearchPreferencesInterestsPageWithTransition />}
          />

          <Route path='likes' element={<LikesPageWithTransition />} />

          <Route path='matches' element={<MatchesPageWithTransition />} />

          <Route path='premium' element={<PremiumPageWithTransition />} />

          <Route path='chats' element={<ChatsWithTransition />} />

          <Route path='chat/:chatId' element={<ChatWithTransition />} />

          <Route path='user/:id' element={<ProfileGuestWithTransition />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
