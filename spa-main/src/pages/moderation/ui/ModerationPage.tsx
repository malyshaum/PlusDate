import { Outlet } from "react-router-dom"
import { StickyLogo } from "@/shared/ui"

export const ModerationPage = () => {
  return (
    <main className='flex flex-col h-full relative'>
      <StickyLogo />
      <div className='flex-1 flex flex-col h-full overflow-auto'>
        <Outlet />
      </div>
    </main>
  )
}
