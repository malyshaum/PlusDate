import { create } from "zustand"

interface ReportSuccessModalStore {
  isOpen: boolean
  showModal: () => void
  hideModal: () => void
}

export const useReportSuccessModal = create<ReportSuccessModalStore>((set) => ({
  isOpen: false,
  showModal: () => set({ isOpen: true }),
  hideModal: () => set({ isOpen: false }),
}))
