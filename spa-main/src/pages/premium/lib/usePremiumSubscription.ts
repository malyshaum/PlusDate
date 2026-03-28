import { useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  useSubscription,
  useStarsSubscription,
  useSpbSubscription,
  useCurrentSubscription,
  useCancelSubscription,
  SUBSCRIPTION_KEYS,
} from "@/pages/premium/api/query"
import { usePaymentModal } from "@/shared/lib/usePaymentModal"
import { getActiveSubscription, getCurrentPlan } from "@/pages/premium/lib/helpers"
import type { Range } from "@/pages/premium/model/types"
import { USER_KEYS } from "@/entities/user/api/queries.ts"

export const usePremiumSubscription = (selectedPlan: Range) => {
  const { showPaymentModal } = usePaymentModal()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: subscription } = useCurrentSubscription()

  const activeSubscription = useMemo(() => getActiveSubscription(subscription), [subscription])
  const currentPlan = useMemo(() => getCurrentPlan(activeSubscription), [activeSubscription])

  const mutationCallbacks = {
    onSuccess: () => {
      showPaymentModal("success")
      setTimeout(() => {
        void queryClient.refetchQueries({ queryKey: [USER_KEYS.user, USER_KEYS.me] })
        void queryClient.refetchQueries({
          queryKey: [SUBSCRIPTION_KEYS.subscription, SUBSCRIPTION_KEYS.current],
        })
      }, 500)
    },
    onError: () => {
      showPaymentModal("error")
    },
  }

  const handleReturnFromTribute = async () => {
    await navigate("/profile")
  }

  const subscribeMutation = useSubscription(selectedPlan)
  const starsSubscribeMutation = useStarsSubscription(selectedPlan, mutationCallbacks)
  const spbSubscribeMutation = useSpbSubscription(selectedPlan, handleReturnFromTribute)
  const cancelSubscriptionMutation = useCancelSubscription()

  const isLoading =
    subscribeMutation.isPending ||
    starsSubscribeMutation.isPending ||
    spbSubscribeMutation.isPending ||
    cancelSubscriptionMutation.isPending

  return {
    currentPlan,
    activeSubscription,
    isLoading,
    subscribeMutation,
    starsSubscribeMutation,
    spbSubscribeMutation,
    cancelSubscriptionMutation,
  }
}
