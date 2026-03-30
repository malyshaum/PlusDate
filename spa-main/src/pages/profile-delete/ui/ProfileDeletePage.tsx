import { PageLayout } from "@/widgets"
import { BottomButtonGroup, CheckboxField, ConfirmationModal, TextareaField } from "@/shared/ui"
import { getOptions } from "@/pages/profile-delete/lib/contants.ts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Schema, type TSchema } from "@/pages/profile-delete/lib/form.ts"
import { useState, useMemo, useEffect, useRef } from "react"
import { useDeleteProfile } from "@/entities/user/api/queries.ts"
import IconTrash from "@/shared/assets/icons/icon-trash.svg?react"
import { useNavigate } from "react-router-dom"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useTranslation } from "react-i18next"
import { useKeyboardAware } from "@/shared/lib/useKeyboardAware.tsx"
import { useCurrentSubscription } from "@/pages/premium/api/query.ts"
import { isStripeActive } from "@/pages/premium/lib/helpers.ts"
import { useToast } from "@/shared/lib/useToast.ts"
import { useLaunchParams } from "@tma.js/sdk-react"

export const ProfileDeletePage = () => {
  const launchParams = useLaunchParams()
  const { platform } = launchParams
  const keyboardAwareRef = useKeyboardAware()
  const { t } = useTranslation()
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [hideButtons, setHideButtons] = useState(false)
  const windowHeightRef = useRef(window.innerHeight)
  const { data: subscription } = useCurrentSubscription()
  const { showToast } = useToast()

  const hasActiveStripeSubscription =
    isStripeActive(subscription?.stripe) && !subscription?.stripe?.ends_at

  const options = useMemo(() => getOptions(t), [t])

  const methods = useForm<TSchema>({
    resolver: zodResolver(Schema),
    mode: "onSubmit",
    defaultValues: {
      reasons: [],
      note: "",
    },
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    register,
  } = methods

  const reasons = watch("reasons")

  const { mutate: deleteProfile, isPending } = useDeleteProfile({
    onSuccess: () => {
      setIsConfirmModalOpen(false)
      void navigate("/profile/restore")
      sessionStorage.setItem("account.deleted", "true")
    },
    onError: (error) => {
      console.error("Failed to delete profile:", error)
      setIsConfirmModalOpen(false)
    },
  })

  const handleOpenConfirmModal = () => {
    triggerImpact()

    if (hasActiveStripeSubscription) {
      showToast({
        text: t("profileDelete.cancelSubscriptionFirst"),
        onClick: () => void navigate("/premium"),
      })
      return
    }

    setIsConfirmModalOpen(true)
  }

  const handleCancelDelete = () => {
    triggerImpact()
    setIsConfirmModalOpen(false)
  }

  const handleConfirmDelete = handleSubmit((data) => {
    triggerImpact()
    deleteProfile(data)
  })

  const scrollToBottom = () => {
    const container = keyboardAwareRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }

  const handleFocus = () => {
    setHideButtons(true)
    setTimeout(
      () => {
        scrollToBottom()
      },
      platform === "ios" ? 500 : 600,
    )
  }

  const handleBlur = () => {
    setTimeout(() => setHideButtons(false), 350)
  }

  useEffect(() => {
    const handleResize = () => {
      const previousHeight = windowHeightRef.current
      windowHeightRef.current = window.innerHeight
      const textarea = document.activeElement as HTMLElement
      if (textarea && textarea.tagName === "TEXTAREA") {
        setHideButtons(window.innerHeight < previousHeight)
      } else {
        setHideButtons(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <PageLayout
      className={`overflow-y-auto h-400 ${!hideButtons ? "pb-safe-area-bottom-with-buttons" : "pb-8"}`}
      ref={keyboardAwareRef}
    >
      <h1 className='title1-bold mb-4'>{t("profileDelete.title")}</h1>
      <CheckboxField<TSchema>
        name='reasons'
        options={options}
        control={control}
        maxSelections={6}
        classNameOptions='!pb-0 overflow-y-visible'
      />

      <TextareaField<TSchema>
        name='note'
        placeholder={t("profileDelete.notePlaceholder")}
        register={register}
        note={t("profileDelete.noteLimit")}
        error={errors.note}
        className='mt-4'
        onFocus={handleFocus}
        onBlurCapture={handleBlur}
      />

      {!hideButtons && (
        <BottomButtonGroup
          primaryButton={{
            children: <span>{t("profileDelete.cancelButton")}</span>,
            onClick: () => {
              void navigate(-1)
            },
          }}
          secondaryButton={{
            children: (
              <span className='text-attention body-regular normal-case'>
                {t("profileDelete.deleteButton")}
              </span>
            ),
            onClick: handleOpenConfirmModal,
            disabled: reasons.length < 1 || !isValid,
            appearance: "hidden",
          }}
          className='absolute bottom-0 left-0 right-0 z-20'
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        icon={<IconTrash />}
        title={t("profileDelete.confirmModal.title")}
        description={t("profileDelete.confirmModal.description")}
        primaryButton={{
          children: t("profileDelete.confirmModal.deleteButton"),
          onClick: handleConfirmDelete,
          isLoading: isPending,
        }}
        secondaryButton={{
          children: t("profileDelete.confirmModal.cancelButton"),
          onClick: handleCancelDelete,
        }}
        onOutsideClick={handleCancelDelete}
      />
    </PageLayout>
  )
}
