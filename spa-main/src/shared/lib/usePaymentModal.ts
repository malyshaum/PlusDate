import type { Range } from "@/pages/premium/model/types"
import { create } from "zustand"

type PaymentModalType = "success" | "error" | null

interface PaymentModalStore {
  modalType: PaymentModalType
  subscriptionType?: Range | null
  showPaymentModal: (type: "success" | "error", subscriptionType?: Range) => void
  closePaymentModal: () => void
}

export const usePaymentModal = create<PaymentModalStore>((set) => ({
  modalType: null,
  subscriptionType: null,
  showPaymentModal: (type, subscriptionType) =>
    set({ modalType: type, subscriptionType: subscriptionType ?? null }),
  closePaymentModal: () => set({ modalType: null, subscriptionType: null }),
}))
