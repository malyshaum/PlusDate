import { useUser } from "@/entities/user/api/queries.ts"
import React, { useEffect, useState } from "react"
import { setAuthFailureCallback } from "@/shared/api/instance.api.ts"
import { useCurrentSubscription } from "@/pages/premium/api/query"
import Cookies from "js-cookie"
import { useLocation } from "react-router-dom"

interface Props {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const isAccountDeleted = sessionStorage.getItem("account.deleted") === "true"
  const { data: user, isLoading, error } = useUser()
  const location = useLocation()
  const subscriptionQuery = useCurrentSubscription(!isAccountDeleted)
  const [authFailureError, setAuthFailureError] = useState<Error | null>(null)

  useEffect(() => {
    const isAccountDeleted = sessionStorage.getItem("account.deleted") === "true"
    const onPremiumRoute = location.pathname.startsWith("/premium")
    const hasAuthToken = !!Cookies.get("auth_token")

    if (onPremiumRoute && hasAuthToken) {
      if (subscriptionQuery.isFetched || subscriptionQuery.isError) {
        setTimeout(() => {
          const splashScreen = document.querySelector("#hydration-screen")
          if (splashScreen) splashScreen.remove()
        }, 500)
      }
    } else if (user || isAccountDeleted) {
      const splashScreen = document.querySelector("#hydration-screen")
      if (splashScreen) {
        splashScreen.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, location.pathname, subscriptionQuery.status])

  useEffect(() => {
    setAuthFailureCallback((err) => {
      setAuthFailureError(err)
    })
  }, [])

  if (authFailureError) {
    throw authFailureError
  }

  if (error) {
    throw new Error(`Failed to load user: ${error.message || "Unknown error"}`)
  }

  return children
}
