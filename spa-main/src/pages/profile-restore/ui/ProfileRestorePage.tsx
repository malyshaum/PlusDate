import { PageLayout } from "@/widgets"
import { BottomButtonGroup } from "@/shared/ui"
import IconRestore from "@/shared/assets/icons/icon-restore.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useTranslation } from "react-i18next"
import { useUserLogin } from "@/entities/user/api/queries.ts"
import { retrieveRawInitData } from "@tma.js/sdk-react"
import { useNavigate } from "react-router-dom"

export const ProfileRestorePage = () => {
  const navigate = useNavigate()
  const initData = retrieveRawInitData()
  const { triggerImpact } = useHapticFeedback()
  const { t } = useTranslation()
  const login = useUserLogin({
    onSuccess: () => {
      sessionStorage.removeItem("account.deleted")
      void navigate("/feed", { replace: true })
    },
  })

  return (
    <PageLayout className='pb-safe-area-bottom-with-buttons flex flex-col items-center justify-center text-center px-8'>
      <IconRestore />
      <h1 className='title1-bold mb-1'>{t("profileRestore.title")}</h1>
      <p className='body-regular text-white-50'>{t("profileRestore.description")}</p>

      <BottomButtonGroup
        primaryButton={{
          children: t("profileRestore.restoreButton"),
          onClick: () => {
            triggerImpact()
            if (initData) {
              void login.mutate({ query: initData, restore: true })
            }
          },
          isLoading: login.isPending,
        }}
        secondaryButton={{
          children: t("profileRestore.supportButton"),
          onClick: () => {
            triggerImpact()
            window.open("https://t.me/PlusDateSupport", "_blank")
          },
        }}
        className='absolute bottom-0 left-0 right-0 z-20'
      ></BottomButtonGroup>
    </PageLayout>
  )
}
