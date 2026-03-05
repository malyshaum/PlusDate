import { create } from "zustand"

interface ToastData {
  note?: string
  text: string
  imageUrl?: string
  onClick?: () => void
}

interface Toast extends ToastData {
  id: string
}

interface ToastStore {
  toasts: Toast[]
  showToast: (data: ToastData) => void
  hideToast: (id: string) => void
}

const MAX_TOASTS = 1

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (data) =>
    set((state) => {
      const newToast: Toast = {
        ...data,
        id: `${Date.now()}-${Math.random()}`,
      }

      const updatedToasts = [...state.toasts, newToast]

      if (updatedToasts.length > MAX_TOASTS) {
        return { toasts: updatedToasts.slice(-MAX_TOASTS) }
      }

      return { toasts: updatedToasts }
    }),
  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
