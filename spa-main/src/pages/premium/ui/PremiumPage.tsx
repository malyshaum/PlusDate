import { PageLayout } from "@/widgets"
import { withTranslation, type WithTranslation } from "react-i18next"
import { BottomButton } from "@/shared/ui"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import classNames from "classnames"
import TextPlusDate from "../assets/plus-date.svg"
import {
  plans,
  usePremiumBackButton,
  usePremiumSubscription,
  getSubscriptionInfo,
  type PaymentMethod,
  type Step,
} from "../lib"
import type { Range } from "@/pages/premium/model/types"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback"
import { WomenInfoModal } from "./WomenInfoModal"
import { TributeConfirmModal } from "./TributeConfirmModal"
import { PaymentBlock } from "./PaymentBlock"
import { OffersBlock } from "./OffersBlock"
import { getPrivacyLink, getTermsLink } from "@/shared/lib/getLegalLinks.ts"
import { useTranslation } from "react-i18next"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent"

const PremiumPageBase = ({ t }: WithTranslation) => {
  const { triggerImpact } = useHapticFeedback()
  const { i18n } = useTranslation()
  const [step, setStep] = useState<Step>("offers")
  const [selectedPlan, setSelectedPlan] = useState<Range>(plans[1]?.range || plans[0]?.range)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("stars")
  const [showTributeConfirm, setShowTributeConfirm] = useState(false)
  const sendEvent = useUserGTMEvent()

  const {
    currentPlan,
    activeSubscription,
    isLoading,
    subscribeMutation,
    starsSubscribeMutation,
    spbSubscribeMutation,
    cancelSubscriptionMutation,
  } = usePremiumSubscription(selectedPlan)

  const subscriptionInfo = getSubscriptionInfo(activeSubscription)

  usePremiumBackButton(step, () => setStep("offers"))

  const handleContinue = () => {
    if (currentPlan) return

    triggerImpact()
    if (step === "offers") {
      setStep("payment")
      sendEvent({
        event: "select_item",
        ecommerce: { items: [{ item_id: selectedPlan, item_name: selectedPlan }] },
      })
    } else {
      // Payment handling
      const paymentPlan = plans.find((plan) => plan.range === selectedPlan)
      if (selectedPayment === "stars") {
        starsSubscribeMutation.mutate()
        if (paymentPlan) {
          sendEvent({
            event: "begin_checkout",
            ecommerce: {
              currency: "stars",
              value: paymentPlan.priceDiscount ?? paymentPlan.priceStar,
              items: [
                {
                  item_id: selectedPlan,
                  item_name: selectedPlan,
                  price: paymentPlan.priceDiscount ?? paymentPlan.priceStar,
                  quantity: 1,
                  item_category: "subscription",
                  item_variant: selectedPlan,
                },
              ],
            },
          })
        }
      } else if (selectedPayment === "spb") {
        setShowTributeConfirm(true)
      } else {
        if (paymentPlan) {
          sendEvent({
            event: "begin_checkout",
            ecommerce: {
              currency: "USD",
              value: paymentPlan.priceDollar,
              items: [
                {
                  item_id: selectedPlan,
                  item_name: selectedPlan,
                  price: paymentPlan.priceDollar,
                  quantity: 1,
                  item_category: "subscription",
                  item_variant: selectedPlan,
                },
              ],
            },
          })
        }
        subscribeMutation.mutate()
      }
    }
  }

  const handleCancelSubscription = () => {
    if (!currentPlan) return
    triggerImpact()
    cancelSubscriptionMutation.mutate(currentPlan)
  }

  const handleConfirmTribute = () => {
    const paymentPlan = plans.find((plan) => plan.range === selectedPlan)
    if (paymentPlan) {
      sendEvent({
        event: "begin_checkout",
        ecommerce: {
          currency: "USD",
          value: paymentPlan.priceDollar,
          items: [
            {
              item_id: selectedPlan,
              item_name: selectedPlan,
              price: paymentPlan.priceDollar,
              quantity: 1,
              item_category: "subscription",
              item_variant: selectedPlan,
            },
          ],
        },
      })
    }
    setShowTributeConfirm(false)
    spbSubscribeMutation.mutate()
  }

  const pageTitle = step === "offers" ? t("premium.getPremium") : t("premium.choosePaymentMethod")
  const pageSubtitle = step === "offers" ? null : t("premium.choosePaymentMethodSubtitle")

  useEffect(() => {
    if (currentPlan) {
      setSelectedPlan(currentPlan)
    }
  }, [currentPlan])

  return (
    <PageLayout className='!px-0'>
      <WomenInfoModal />
      <TributeConfirmModal
        isOpen={showTributeConfirm}
        onConfirm={handleConfirmTribute}
        onCancel={() => setShowTributeConfirm(false)}
        isLoading={spbSubscribeMutation.isPending}
      />
      <div
        className={classNames(
          "bg-[radial-gradient(70.21%_46.13%_at_50.13%_46.13%,rgba(255,61,108,0.25)_0.01%,rgba(255,61,108,0)_97.12%)]",
          "h-[410px] w-full fixed top-[130px] left-0 right-0 pointer-events-none",
        )}
      />
      <div className='h-full flex flex-col overflow-y-auto pb-24 overflow-x-hidden'>
        <img src={TextPlusDate} alt='plus-date-premium' className='mx-auto block mt-[50px]' />

        <AnimatePresence mode='wait'>
          {step === "offers" ? (
            <motion.div
              key='offers'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OffersBlock
                selectedPlan={selectedPlan}
                onPlanSelect={setSelectedPlan}
                currentPlan={currentPlan}
              />
            </motion.div>
          ) : (
            <motion.div
              key='payment'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h1 className='text-center title1-bold mt-[110px]'>{pageTitle}</h1>
                {pageSubtitle && (
                  <p className='caption1-medium text-white-50 text-center'>{pageSubtitle}</p>
                )}
              </div>

              <PaymentBlock
                selectedPayment={selectedPayment}
                onPaymentSelect={setSelectedPayment}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <p className='text-white-50 mt-4 subtitle-medium-no-caps text-center px-4'>
          {t("premium.autoRenewal")}
        </p>
        <p className='text-white-50 subtitle-medium-no-caps text-center px-4'>
          <a
            href={getTermsLink(i18n.language)}
            className='underline'
            target='_blank'
            rel='noreferrer'
          >
            {t("terms")}
          </a>{" "}
          {t("and")}{" "}
          <a
            href={getPrivacyLink(i18n.language)}
            className='underline'
            target='_blank'
            rel='noreferrer'
          >
            {t("privacy")}
          </a>
          . {t("premium.bonusDisclaimer")}
        </p>

        {subscriptionInfo?.type === "stripe" && !subscriptionInfo.isCanceled ? (
          <BottomButton
            appearance='white'
            onClick={handleCancelSubscription}
            disabled={isLoading}
            isLoading={isLoading}
          >
            <span className='button-main'>{t("premium.cancelSubscription")}</span>
          </BottomButton>
        ) : subscriptionInfo?.isCanceled || subscriptionInfo?.type === "telegram" ? (
          <div className='fixed bottom-0 left-0 right-0 pb-safe-area-bottom pt-4 px-4 text-center'>
            <p className='small-medium text-white-50'>
              {t("premium.subscriptionExpires", { count: subscriptionInfo.diffInDays })}
            </p>
          </div>
        ) : (
          <BottomButton onClick={handleContinue} disabled={isLoading} isLoading={isLoading}>
            <span className='button-main'>{t("continue")}</span>
          </BottomButton>
        )}
      </div>
    </PageLayout>
  )
}

export const PremiumPage = withTranslation()(PremiumPageBase)
