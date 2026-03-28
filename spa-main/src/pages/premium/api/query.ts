import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Range } from "@/pages/premium/model/types.ts"
import {
  getCheckoutLink,
  getStarsInvoiceLink,
  getSpbPaymentLink,
  getCurrentSubscription,
  cancelSubscription,
} from "@/pages/premium/api/api.ts"
import { openLink, openTelegramLink, invoice } from "@tma.js/sdk-react"

interface UseSubscriptionCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const SUBSCRIPTION_KEYS = {
  subscription: "subscription",
  current: "current",
}

export const useSubscription = (range: Range) => {
  return useMutation({
    mutationKey: ["stripe-subscribe", range],
    mutationFn: () => getCheckoutLink(range),
    onSuccess: (res) => {
      localStorage.setItem("pending_payment", "stripe")
      localStorage.setItem("pending_payment_range", range)
      if (openLink.isAvailable()) {
        openLink(res.url)
      } else {
        window.open(res.url, "_blank")
      }
    },
  })
}

export const useStarsSubscription = (range: Range, callbacks?: UseSubscriptionCallbacks) => {
  return useMutation({
    mutationKey: ["stars-subscribe", range],
    mutationFn: () => getStarsInvoiceLink(range),
    onSuccess: async (res) => {
      try {
        if (invoice.openUrl.isAvailable()) {
          const status = await invoice.openUrl(res.url)
          // TODO debug
          console.log(status, "statis")
          if (status === "paid") {
            console.log(123)
            callbacks?.onSuccess?.()
          } else if (status === "cancelled") {
            console.log("Payment cancelled by user")
          } else if (status === "failed") {
            console.error("Payment failed")
          }
        } else {
          console.error("Invoice API not available")
        }
      } catch (error) {
        console.error("Error opening invoice:", error)
        callbacks?.onError?.(error as Error)
      }
    },
  })
}

export const useSpbSubscription = (range: Range, onBeforeOpenPayment?: () => Promise<void>) => {
  return useMutation({
    mutationKey: ["spb-subscribe", range],
    mutationFn: () => getSpbPaymentLink(range),
    onSuccess: async (res) => {
      localStorage.setItem("pending_payment", "tribute")
      localStorage.setItem("pending_payment_range", range)

      if (onBeforeOpenPayment) {
        await onBeforeOpenPayment()
      }

      if (openTelegramLink.isAvailable()) {
        openTelegramLink(res.url)
      } else {
        window.open(res.url, "_blank")
      }
    },
  })
}

export const useCurrentSubscription = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [SUBSCRIPTION_KEYS.subscription, SUBSCRIPTION_KEYS.current],
    queryFn: getCurrentSubscription,
    enabled,
  })
}

export const useCancelSubscription = (callbacks?: UseSubscriptionCallbacks) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [SUBSCRIPTION_KEYS.subscription, "cancel"],
    mutationFn: (range: Range) => cancelSubscription(range),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTION_KEYS.subscription, SUBSCRIPTION_KEYS.current],
      })
      void queryClient.invalidateQueries({ queryKey: ["user"] })
      callbacks?.onSuccess?.()
    },
    onError: (error) => {
      callbacks?.onError?.(error)
    },
  })
}
