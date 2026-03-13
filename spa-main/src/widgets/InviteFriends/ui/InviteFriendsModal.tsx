import { useCallback, useState } from "react"
import { withTranslation, type WithTranslation } from "react-i18next"
import { shareURL, shareStory } from "@tma.js/sdk-react"
import { Button } from "@/shared/ui"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import IconHeart84 from "@/shared/assets/icons/icon-heart-84.svg?react"
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react"
import IconCopy from "@/shared/assets/icons/share/icon-copy.svg?react"
import IconShare from "@/shared/assets/icons/share/icon-share.svg?react"
import IconStory from "@/shared/assets/icons/share/icon-story.svg?react"
import IconCheckWhite from "@/shared/assets/icons/icon-check-white.svg?react"
import { useUser } from "@/entities/user/api/queries.ts"
import { Snackbar } from "@/widgets/Snackbar"

interface Props extends WithTranslation {
  onClose?: () => void
}

const InviteFriendsModalBase = ({ t, i18n, onClose }: Props) => {
  const { triggerImpact } = useHapticFeedback()
  const { data: user } = useUser()
  const [showSnackbar, setShowSnackbar] = useState(false)

  const inviteLink = `https://t.me/znakomstva_datingg_bot?start=${user?.id}`
  const shareMessage = t("inviteFriends.shareMessage")

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      triggerImpact()
      setShowSnackbar(true)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }, [inviteLink, triggerImpact])

  const handleShareToFriends = useCallback(async () => {
    try {
      triggerImpact()
      if (shareURL.isAvailable()) {
        shareURL(inviteLink, shareMessage)
      } else {
        await handleCopyLink()
      }
    } catch (err) {
      console.error("Failed to share:", err)
    }
  }, [inviteLink, shareMessage, handleCopyLink, triggerImpact])

  const handleAddToStory = useCallback(async () => {
    try {
      triggerImpact()

      const locale = i18n.language
      const storyMediaUrl = `${window.location.origin}/share/${locale}.png`

      if (shareStory.isAvailable()) {
        shareStory(storyMediaUrl, {
          text: shareMessage,
          widgetLink: {
            url: inviteLink,
            name: t("joinApp"),
          },
        })
      } else {
        await handleShareToFriends()
      }
    } catch (err) {
      console.error("Failed to add to story:", err)
    }
  }, [triggerImpact, i18n.language, shareMessage, inviteLink, t, handleShareToFriends])

  const handleMainShare = useCallback(() => {
    void handleShareToFriends()
    onClose?.()
  }, [handleShareToFriends, onClose])

  return (
    <div>
      <IconHeart84 className='mx-auto' />
      <h2 className='title1-bold text-center'>{t("inviteFriends.title")}</h2>
      <p className='mt-1 body-regular text-white-50 text-center'>
        {t("inviteFriends.description")}
      </p>
      <ul className='mt-6'>
        <li
          className='flex justify-between items-center bg-white-5 border border-white-5 h-[52px] rounded-xl py-2 px-4 cursor-pointer transition-colors'
          onClick={() => void handleCopyLink()}
        >
          <div className='flex items-center gap-4'>
            <IconCopy />
            <div>
              <div className='body-bold'>{t("inviteFriends.copyLink.title")}</div>
              <div className='subtitle-medium-no-caps mt-1 text-white-50'>
                {t("inviteFriends.copyLink.subtitle")}
              </div>
            </div>
          </div>
          <ChevronIcon />
        </li>
        <li
          className='flex justify-between items-center mt-2 bg-white-5 border border-white-5 h-[52px] rounded-xl py-2 px-4 cursor-pointer transition-colors'
          onClick={() => void handleShareToFriends()}
        >
          <div className='flex items-center gap-4'>
            <IconShare />
            <div>
              <div className='body-bold'>{t("inviteFriends.shareFriends.title")}</div>
              <div className='subtitle-medium-no-caps mt-1 text-white-50'>
                {t("inviteFriends.shareFriends.subtitle")}
              </div>
            </div>
          </div>
          <ChevronIcon />
        </li>
        <li
          className='flex justify-between items-center mt-2 bg-white-5 border border-white-5 h-[52px] rounded-xl py-2 px-4 cursor-pointer transition-colors'
          onClick={() => void handleAddToStory()}
        >
          <div className='flex items-center gap-4'>
            <IconStory />
            <div>
              <div className='body-bold'>{t("inviteFriends.addStory.title")}</div>
              <div className='subtitle-medium-no-caps mt-1 text-white-50'>
                {t("inviteFriends.addStory.subtitle")}
              </div>
            </div>
          </div>
          <ChevronIcon />
        </li>
      </ul>
      <Button className='w-full mt-8' size='L' onClick={handleMainShare}>
        <span>{t("inviteFriends.shareButton")}</span>
      </Button>
      <Snackbar isOpen={showSnackbar} onClose={() => setShowSnackbar(false)}>
        <div className='flex items-center gap-1'>
          <IconCheckWhite />
          <span className='body-regular text-white'>{t("inviteFriends.linkCopied")}</span>
        </div>
      </Snackbar>
    </div>
  )
}

export const InviteFriendsModal = withTranslation()(InviteFriendsModalBase)
