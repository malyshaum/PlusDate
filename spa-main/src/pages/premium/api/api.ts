import api from "@/shared/api/instance.api.ts"
import type { ISubscription, Range, TSubscribe } from "@/pages/premium/model/types.ts"

export const getCurrentSubscription = (): Promise<ISubscription> => {
  return api.get("/payment/subscription")
}

export const getCheckoutLink = async (range: Range): Promise<TSubscribe> => {
  return api.post("/payment/subscribe", { range })
}

export const getStarsInvoiceLink = async (range: Range): Promise<TSubscribe> => {
  return api.post("/payment/telegram/invoice", { range })
}

export const getSpbPaymentLink = async (range: Range): Promise<TSubscribe> => {
  return api.post("/payment/tribute", { range })
}

export const cancelSubscription = async (range: Range) => {
  return api.post("/payment/subscription/cancel", { range })
}
