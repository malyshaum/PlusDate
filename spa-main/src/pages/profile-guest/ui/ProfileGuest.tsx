import { PageLayout } from "@/widgets"
import { UserProfile } from "@/entities/UserProfile/ui/UserProfile.tsx"
import { type WithTranslation, withTranslation } from "react-i18next"
import { BottomButtonGroup, ConfirmationModal, SwipeButton, Skeleton } from "@/shared/ui"
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom"
import { useExternalUser, useUser } from "@/entities/user/api/queries.ts"
import {
  useDeleteProfileMatch,
  useSwipeProfile,
  useViewProfileMatch,
} from "@/features/SwipeCards/api/queries.ts"
import { useCallback, useEffect, useState } from "react"
import IconTrash from "@/shared/assets/icons/icon-trash.svg?react"
import IconClose from "@/shared/assets/icons/icon-close.svg"
import IconHeart from "@/shared/assets/icons/icon-heart-default.svg"
import IconChat from "@/shared/assets/icons/icon-chat.svg?react"
import { createPortal } from "react-dom"
import { SwipeMatch } from "@/features/SwipeCards"
import type { Match } from "@/features/SwipeCards/model/types.ts"
import { useCentrifugeEvent } from "@/shared/sockets"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"

export const ProfileGuestBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { data: user } = useUser()
  const [searchParams] = useSearchParams()
  const locationState = location.state as {
    reportSource?: string
    chatId?: number
    isViewed?: boolean
  } | null
  const reportSource = locationState?.reportSource
  const chatId = locationState?.chatId
  const isViewed = locationState?.isViewed
  const showRemoveMatch = searchParams.get("showRemoveMatch") === "true"
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [match, setMatch] = useState<Match | null>()
  const swipeProfileMutation = useSwipeProfile()
  const viewProfileMatchMutation = useViewProfileMatch({})

  const userId = id ? parseInt(id) : undefined
  const { data: externalUser } = useExternalUser(userId)
  const deleteProfileMatchMutation = useDeleteProfileMatch({
    onSuccess: () => {
      if (reportSource === "match_profile") void navigate(-1)
      void navigate("/chats")
    },
  })

  const handleMatchDeleted = useCallback(
    (data: { user_id: number }) => {
      if (data.user_id === Number(userId)) {
        void navigate("/chats", { replace: true })
      }
    },
    [userId, navigate],
  )

  useCentrifugeEvent<{ user_id: number }>("user.match_deleted", handleMatchDeleted, !!user?.id)

  useEffect(() => {
    if (reportSource === "match_profile" && isViewed === false && userId) {
      viewProfileMatchMutation.mutate(userId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveMatch = () => {
    triggerImpact()
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = () => {
    triggerImpact()
    if (!externalUser?.feed_profile.id) return
    deleteProfileMatchMutation.mutate(externalUser?.feed_profile.id)
    setIsConfirmModalOpen(false)
  }

  const handleCancelDelete = () => {
    triggerImpact()
    setIsConfirmModalOpen(false)
  }

  const navigateToReport = useCallback(async () => {
    triggerImpact()
    if (!externalUser?.id) return

    const source = reportSource || (showRemoveMatch ? "chat_profile" : "like_profile")
    await navigate("/profile/report", { state: { userId: externalUser.id, source } })
  }, [triggerImpact, externalUser?.id, reportSource, showRemoveMatch, navigate])

  const handleDislike = () => {
    triggerImpact()
    if (!externalUser?.feed_profile?.id) return

    swipeProfileMutation.mutate(
      {
        profileId: externalUser.feed_profile.id,
        action: "dislike",
      },
      {
        onSuccess: () => {
          void navigate("/likes")
        },
      },
    )
  }

  const handleLike = () => {
    triggerImpact()
    if (!externalUser?.feed_profile?.id) return
    swipeProfileMutation.mutate(
      {
        profileId: externalUser.feed_profile.id,
        action: "like",
      },
      {
        onSuccess: (res) => {
          setMatch(res)
        },
      },
    )
  }

  const closeMatch = useCallback(() => {
    triggerImpact()
    void navigate("/likes")
  }, [navigate, triggerImpact])

  const handleNavigateToChat = useCallback(() => {
    triggerImpact()
    if (chatId && userId) {
      void navigate(`/chat/${chatId}?userId=${userId}`)
    }
  }, [triggerImpact, chatId, userId, navigate])

  return (
    <PageLayout className='!px-0 pb-0 flex flex-col'>
      {!externalUser && (
        <div className='flex-1 mx-4 rounded-[24px] overflow-hidden'>
          <Skeleton className='w-full h-full rounded-[24px]' />
        </div>
      )}
      {externalUser && (
        <UserProfile
          previewMode={false}
          user={externalUser}
          expanded={true}
          guestMode={true}
          guestPreview={true}
          className='flex-1 mx-4'
        >
          {reportSource === "match_profile" ? (
            <div className='mt-3 flex items-center gap-3'>
              <SwipeButton type='grey' onClick={handleRemoveMatch}>
                <img src={IconClose} alt='delete match' />
              </SwipeButton>
              <SwipeButton type='grey' onClick={handleNavigateToChat}>
                <IconChat className='w-6 h-6' />
              </SwipeButton>
            </div>
          ) : (
            !showRemoveMatch && (
              <div className='mt-3 flex items-center gap-3'>
                <SwipeButton type='grey' onClick={handleDislike}>
                  <img src={IconClose} alt='dislike' />
                </SwipeButton>
                <SwipeButton type='cta' onClick={handleLike}>
                  <img src={IconHeart} alt='like' />
                </SwipeButton>
              </div>
            )
          )}
        </UserProfile>
      )}
      <BottomButtonGroup
        primaryButton={{
          onClick: handleRemoveMatch,
          type: "button",
          children: <span className='button-main'>{t("deleteMatch.title")}</span>,
          buttonWrapperClassName:
            showRemoveMatch && reportSource !== "match_profile" ? "" : "!hidden",
          isLoading: deleteProfileMatchMutation.isPending,
          appearance: "white",
        }}
        secondaryButton={{
          onClick: navigateToReport,
          children: (
            <span className='button-main text-attention'>{t("profileReport.reportButton")}</span>
          ),
        }}
        className='!pt-2'
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        icon={<IconTrash />}
        title={t("deleteMatch.title")}
        description={t("deleteMatch.description")}
        primaryButton={{
          children: t("deleteMatch.delete"),
          onClick: handleConfirmDelete,
          isLoading: deleteProfileMatchMutation.isPending,
        }}
        secondaryButton={{
          children: t("deleteMatch.cancel"),
          onClick: handleCancelDelete,
        }}
        onOutsideClick={handleCancelDelete}
      />

      {match?.matched &&
        createPortal(
          <SwipeMatch
            matchUser={match.user}
            onClose={closeMatch}
            chat={match.chat}
            closeButtonLabel={"continue"}
          />,
          document.body,
        )}
    </PageLayout>
  )
}

export const ProfileGuestPage = withTranslation()(ProfileGuestBase)
