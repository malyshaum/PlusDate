import { PageLayout } from "@/widgets"
import {
  SelectionButton,
  TextareaField,
  ConfirmationModal,
  BottomButton,
  IconTextRow,
} from "@/shared/ui"
import { getOptions, type ReportSource } from "@/pages/profile-report/lib/constants"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Schema, type TSchema } from "@/pages/profile-report/lib/form"
import { useMemo, useState } from "react"
import { useBlockUser, useReportUser } from "@/entities/user/api/queries"
import { useSwipeFeedStore } from "@/features/SwipeCards"
import { useNavigate, useLocation } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { useTranslation } from "react-i18next"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware"
import { useReportSuccessModal } from "@/shared/lib/useReportSuccessModal"
import IconEye from "@/shared/assets/icons/report/icon-hidden-eye.svg?react"
import IconChat from "@/shared/assets/icons/report/icon-chat.svg?react"
import IconSound from "@/shared/assets/icons/report/icon-no-sounde.svg?react"

interface LocationState {
  userId: number
  source: ReportSource
}

export const ProfileReportPage = () => {
  const keyboardAwareRef = useKeyboardAware()
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const location = useLocation()
  const { showModal } = useReportSuccessModal()
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { userId, source = "like_profile" } = (location.state as LocationState) || {}

  const options = useMemo(() => getOptions(t), [t])

  const methods = useForm<TSchema>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues: {
      reason_code: "",
      custom_text: null,
    },
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    register,
  } = methods

  const setPendingDislike = useSwipeFeedStore((state) => state.setPendingDislike)

  const { mutateAsync: blockUserMutationAsync } = useBlockUser()
  const { mutate: reportUserMutation, isPending } = useReportUser({
    onSuccess: async () => {
      await blockUserMutationAsync(userId)
      triggerImpact()
      showModal()
      switch (source) {
        case "swipe_feed":
          setPendingDislike(userId)
          return navigate(-1)
        case "like_profile":
          return navigate(-2)
        case "chat_profile":
          return navigate(-3)
        default:
          return navigate(-1)
      }
    },
    onError: (error) => {
      console.error("Failed to report user:", error)
    },
  })

  const handleOpenConfirmation = () => {
    triggerImpact()
    setIsConfirmationOpen(true)
  }

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false)
  }

  const handleReport = handleSubmit((data) => {
    if (!userId) return
    triggerImpact()
    setIsConfirmationOpen(false)
    reportUserMutation({
      reported_user_id: userId,
      reason_code: data.reason_code,
      source,
      custom_text: data.custom_text,
    })
  })

  if (!userId) {
    void navigate(-1)
    return null
  }

  return (
    <PageLayout className='overflow-y-auto pb-safe-area-bottom-with-buttons' ref={keyboardAwareRef}>
      <h1 className='title1-bold mb-4'>{t("profileReport.title")}</h1>

      <Controller
        name='reason_code'
        control={control}
        render={({ field }) => (
          <div className='flex flex-col gap-1'>
            {options.map((option) => (
              <SelectionButton
                key={option.value}
                emoji={option.emoji}
                title={option.label}
                checked={field.value === option.value}
                hasSelection={!!field.value}
                onChange={() => field.onChange(option.value)}
              />
            ))}
          </div>
        )}
      />

      <TextareaField<TSchema>
        name='custom_text'
        placeholder={t("profileDelete.notePlaceholder")}
        register={register}
        note={t("profileReport.customTextLimit")}
        error={errors.custom_text}
        className='mt-2'
      />

      <BottomButton onClick={handleOpenConfirmation} disabled={!isValid}>
        <span>{t("profileReport.reportButton")}</span>
      </BottomButton>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        title={t("profileReport.confirmationModal.title")}
        description={t("profileReport.confirmationModal.description")}
        primaryButton={{
          children: t("profileReport.reportButton"),
          onClick: handleReport,
          isLoading: isPending,
        }}
        onOutsideClick={handleCloseConfirmation}
      >
        <div className='mt-4 mb-6 bg-white-5 border border-white-5 rounded-xl flex flex-col gap-[10px] p-2'>
          <IconTextRow icon={<IconEye />} text={t("profileReport.confirmationModal.option1")} />
          <IconTextRow icon={<IconSound />} text={t("profileReport.confirmationModal.option2")} />
          <IconTextRow icon={<IconChat />} text={t("profileReport.confirmationModal.option3")} />
        </div>
      </ConfirmationModal>
    </PageLayout>
  )
}
