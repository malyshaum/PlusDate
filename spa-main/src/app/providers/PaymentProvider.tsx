import React, { useEffect, useRef } from "react"
import { PaymentSuccess, PaymentError } from "@/widgets"
import { usePaymentModal } from "@/shared/lib/usePaymentModal"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
import { useLocation, useNavigate } from "react-router-dom"
import { useLaunchParams } from "@tma.js/sdk-react"
import { useUser } from "@/entities/user/api/queries"
import type { Range } from "@/pages/premium/model/types"

interface Props {
  children: React.ReactNode
}

export function PaymentProvider({ children }: Props) {
  const { showPaymentModal } = usePaymentModal()
  const navigate = useNavigate()
  const location = useLocation()
  const { modalType, closePaymentModal } = usePaymentModal()
  const { triggerImpact } = useHapticFeedback()
  const launchParams = useLaunchParams()
  const hasProcessedPayment = useRef(false)
  const hasCheckedPendingPayment = useRef(false)
  const { refetch: refetchUser } = useUser()

  const handleDismissModal = () => {
    closePaymentModal()
    triggerImpact()
  }

  useEffect(() => {
    if (hasCheckedPendingPayment.current) return

    const pendingPayment = localStorage.getItem("pending_payment")
    if (!pendingPayment) return

    hasCheckedPendingPayment.current = true

    if (location.pathname !== "/profile") {
      void navigate("/profile", { replace: true })
    }
    void refetchUser().then(({ data }) => {
      if (data?.is_premium) {
        console.log("Payment successful, showing success modal")
        const savedRange = localStorage.getItem("pending_payment_range") as Range
        localStorage.removeItem("pending_payment")
        localStorage.removeItem("pending_payment_range")
        showPaymentModal("success", savedRange)
      }
    })
  }, [location.pathname, navigate, refetchUser, showPaymentModal])

  useEffect(() => {
    const tgWebAppStartParam = launchParams.tgWebAppStartParam

    if (!tgWebAppStartParam || hasProcessedPayment.current) return

    const isPaymentParam =
      tgWebAppStartParam === "payment_success" || tgWebAppStartParam === "payment_error"

    if (!isPaymentParam) {
      return
    }

    const processedKey = `processed_${tgWebAppStartParam}`
    if (sessionStorage.getItem(processedKey)) {
      return
    }

    if (location.pathname !== "/profile") {
      void navigate("/profile", { replace: true })
      return
    }

    hasProcessedPayment.current = true
    sessionStorage.setItem(processedKey, "true")

    const savedRange = localStorage.getItem("pending_payment_range") as Range

    if (tgWebAppStartParam === "payment_success") {
      showPaymentModal("success", savedRange)
    } else if (tgWebAppStartParam === "payment_error") {
      showPaymentModal("error", savedRange)
    }
    localStorage.removeItem("pending_payment")
    localStorage.removeItem("pending_payment_range")
  }, [launchParams.tgWebAppStartParam, navigate, location.pathname, showPaymentModal])

  return (
    <>
      {children}
      <PaymentSuccess isOpen={modalType === "success"} onOutsideClick={handleDismissModal} />
      <PaymentError isOpen={modalType === "error"} onOutsideClick={handleDismissModal} />
    </>
  )
}
