import React, { useEffect } from "react"
import { env } from "@/shared/config/env.ts"
import { MaintenancePage } from "@/pages/maintenance"

interface Props {
  children: React.ReactNode
}

export function MaintenanceProvider({ children }: Props) {
  useEffect(() => {
    if (env.maintenanceMode) {
      // Remove hydration screen when showing maintenance page
      const splashScreen = document.querySelector("#hydration-screen")
      if (splashScreen) splashScreen.remove()
    }
  }, [])

  if (env.maintenanceMode) {
    return <MaintenancePage />
  }

  return children
}
