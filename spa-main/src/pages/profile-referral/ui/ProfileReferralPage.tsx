import { useState, useCallback } from "react"
import { withTranslation, type WithTranslation } from "react-i18next"
import { PageLayout } from "@/widgets"
import IconShareGradient from "@/shared/assets/icons/icon-share-gradient.svg"
import IconChevronRight from "@/shared/assets/icons/icon-chevron-right.svg?react"
import classNames from "classnames"
import { BottomButton } from "@/shared/ui"
import { shareURL } from "@tma.js/sdk-react"

const ProfileReferralBase = ({ t }: WithTranslation) => {
  const link = "https://example.com/referral?user=qwerty12312312312312"
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }, [link])

  const handleShare = useCallback(async () => {
    try {
      if (shareURL.isAvailable()) {
        shareURL(link, t("referral.shareMessage"))
      } else {
        await handleCopy()
      }
    } catch (err) {
      console.error("Failed to share: ", err)
      await handleCopy()
    }
  }, [link, handleCopy, t])

  return (
    <PageLayout>
      <div className='pt-10'>
        <img src={IconShareGradient} alt='icon-share-gradient' className='mx-auto' />
        <h1 className='title1-bold text-center'>{t("referral.title")}</h1>
        <p className='caption1-medium opacity-50 text-center mt-1'></p>

        <div className='flex gap-2 mt-8'>
          <div className='flex-1 p-2 bg-white-10 rounded-[8px]'>
            <h3 className='text-accent subtitle-medium mb-3'>{t("referral.totalEarnings")}</h3>
            <p className='title1-bold'>0.00</p>
            <div className='mt-2 flex items-center justify-between'>
              <span>~0.00$</span>
              <button className='flex items-center text-accent subtitle-medium'>
                <span>{t("referral.withdraw")}</span>
                <IconChevronRight className='[&_path]:stroke-accent' />
              </button>
            </div>
          </div>

          <div className='flex-1 p-2 bg-white-10 rounded-[8px]'>
            <h3 className='text-accent subtitle-medium mb-3'>{t("referral.friendsInvited")}</h3>
            <p className='title1-bold'>0.00</p>
          </div>
        </div>
        <p className='caption1-medium text-white-50 mt-1'>{t("referral.minimumAmount")}</p>

        <div>
          <h4 className='text-accent subtitle-medium mb-2 mt-4'>{t("referral.howToInvite")}</h4>
          <div
            className={classNames(
              "flex items-center justify-between bg-white-10 rounded-[8px] px-4 py-[18px]",
            )}
          >
            <div className='flex items-center gap-1 flex-1 min-w-0 max-w-[85%]'>
              <span className='body-regular truncate'>{link}</span>
            </div>
            <button
              onClick={handleCopy}
              className={classNames(
                "small-medium capitalize",
                isCopied ? "text-grey-50" : "text-blue",
              )}
            >
              {isCopied ? t("referral.copied") : t("referral.copy")}
            </button>
          </div>
        </div>
      </div>

      <BottomButton onClick={() => void handleShare()}>{t("referral.shareLink")}</BottomButton>
    </PageLayout>
  )
}

export const ProfileReferralPage = withTranslation()(ProfileReferralBase)
