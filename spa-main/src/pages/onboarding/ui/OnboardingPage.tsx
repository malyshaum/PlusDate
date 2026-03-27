import { Outlet } from "react-router-dom"
import { ProgressBar } from "@/pages/onboarding/ui/ProgressBar.tsx"
import { StickyLogo } from "@/shared/ui"

export const OnboardingPage = () => {
  return (
    <main className='flex flex-col h-full relative'>
      <StickyLogo />
      <ProgressBar />
      <div className='flex-1 flex flex-col h-full pt-6 overflow-hidden'>
        <Outlet />
      </div>
    </main>
  )
}
