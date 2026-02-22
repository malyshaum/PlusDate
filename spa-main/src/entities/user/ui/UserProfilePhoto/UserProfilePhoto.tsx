import type { IUserFile } from "@/entities/user/model/types.ts"
import { withTranslation, type WithTranslation } from "react-i18next"
import IconPencil from "@/shared/assets/icons/icon-pencil.svg?react"
import IconPencilRound from "@/shared/assets/icons/icon-pencil-round.svg"
import IconCloseRound from "@/shared/assets/icons/icon-close-rounded.svg"
import IconPin from "@/shared/assets/icons/icon-pin.svg?react"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useRef, lazy, Suspense } from "react"
import classNames from "classnames"
import { z } from "zod"
import { createFileImageRules } from "@/shared/validations/zod.ts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useDeleteFile,
  useSetUserPhotoMain,
  useUpdateUserPhoto,
} from "@/entities/user/api/queries.ts"
import { PhotoPreview } from "@/shared/ui/FileInput/FilePhotoPreview.tsx"
import { FileVerificationNote, ModerationInfoTooltip } from "@/shared/ui"

const ActionMenu = lazy(() =>
  import("@/widgets").then((module) => ({ default: module.ActionMenu })),
)

interface Props extends IUserFile, WithTranslation {
  className?: string
  allowEdit?: boolean
}

const schema = z.object({
  photo: createFileImageRules(),
})

export type TSchema = z.infer<typeof schema>

const UserProfilePhotoBase = ({
  id,
  url,
  is_under_moderation,
  moderation,
  t,
  allowEdit,
  is_main,
}: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending: isPhotoUpdatePending } = useUpdateUserPhoto()
  const { mutate: deleteMutation, isPending: isDeleteMutationPending } = useDeleteFile()
  const { mutate: setMainPhotoMutation, isPending: isSettingPhotoMainPending } =
    useSetUserPhotoMain()

  const {
    setValue,
    formState: { errors },
    trigger,
    watch,
    reset,
  } = useForm<TSchema>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const allowReplace = !is_under_moderation && allowEdit
  const photoFile = watch("photo")

  const handleReplace = () => {
    if (!allowReplace) return
    triggerImpact()
    fileInputRef.current?.click()
  }

  const handleDelete = () => {
    if (!allowReplace) return
    triggerImpact()
    deleteMutation(id)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setValue("photo", file)
    const isValid = await trigger("photo")
    if (!isValid) return

    mutate(
      {
        photos: [
          {
            file,
            file_id: id,
          },
        ],
      },
      {
        onSuccess: () => {
          triggerImpact("medium")
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
            reset()
          }
        },
      },
    )
  }

  const actions = [
    {
      label: "replace",
      icon: <IconPencil />,
      onClick: handleReplace,
    },
  ]
  if (!is_main) {
    actions.unshift({
      label: "pin",
      icon: <IconPin />,
      onClick: () => setMainPhotoMutation(id),
    })
  }

  const isPending = isPhotoUpdatePending || isSettingPhotoMainPending || isDeleteMutationPending
  const hasModerationIssue = !is_under_moderation && moderation?.length > 0
  const hasError = !!errors.photo || hasModerationIssue

  return (
    <div
      className={classNames(
        "relative h-full overflow-hidden bg-grey-10 rounded-[8px]",
        hasError ? "border-2 border-accent" : "border border-white-10",
      )}
    >
      {isPending && (
        <div className='absolute inset-0 flex items-center justify-center bg-white-10 z-20'>
          <div className='loader' />
        </div>
      )}

      {photoFile ? (
        <PhotoPreview
          file={photoFile}
          alt='user-photo'
          className='w-full h-full object-cover object-top'
        />
      ) : (
        <img src={url} alt='user-photo' className='w-full h-full object-cover object-top' />
      )}

      {errors.photo && (
        <ModerationInfoTooltip message={t(errors.photo.message as string)} />
      )}

      {!errors.photo && is_under_moderation && (
        <FileVerificationNote type='info' enableTicker={false}>
          {t("verification")}
        </FileVerificationNote>
      )}

      {!errors.photo && !is_under_moderation && moderation?.length > 0 && (
        <ModerationInfoTooltip rejectionReason={moderation[0].rejection_reason} />
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      {allowReplace && !is_main && !moderation?.length && (
        <Suspense fallback={null}>
          <ActionMenu actions={actions} />
        </Suspense>
      )}

      {allowReplace && is_main && !is_under_moderation && !moderation?.length && (
        <button
          type='button'
          className='absolute top-[6px] right-[6px] z-10'
          onClick={handleReplace}
          disabled={isPending}
        >
          <img src={IconPencilRound} alt='replace' loading='lazy' />
        </button>
      )}

      {allowReplace && !is_under_moderation && moderation?.length > 0 && (
        <button
          type='button'
          className='absolute top-[6px] right-[6px] z-10'
          onClick={handleDelete}
          disabled={isPending}
        >
          <img src={IconCloseRound} alt='delete' loading='lazy' />
        </button>
      )}
    </div>
  )
}

export const UserProfilePhoto = withTranslation()(UserProfilePhotoBase)
