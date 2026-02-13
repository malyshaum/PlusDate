import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useUser } from "@/entities/user/api/queries.ts"
import { PageFooter } from "@/widgets"
import { StickyLogo } from "@/shared/ui"

const FOOTER_ROUTES = ["/feed", "/profile", "/likes", "/chats"]

export function RouterGuard() {
  const { data: user } = useUser()
  const { pathname } = useLocation()

  const shouldShowFooter = FOOTER_ROUTES.includes(pathname)

  if (sessionStorage.getItem("account.deleted") === "true" && !user) {
    if (pathname !== "/profile/restore") {
      return <Navigate to='/profile/restore' replace />
    }
    return <Outlet />
  }

  if (!user) return null

  if (user && user?.is_onboarded === false) {
    if (!pathname.startsWith("/onboarding")) {
      return <Navigate to='/onboarding' replace />
    }
    return <Outlet />
  }

  const isUserBlocked = user?.blocked === true
  if (isUserBlocked) {
    if (!pathname.startsWith("/blocked")) {
      return <Navigate to='/blocked' replace />
    }
  }

  const hasUnresolvedModeration = user?.moderation?.some(
    (m) =>
      !m.is_resolved && [1, 2, 3, 4, 5, 9, 13, 14, 15, 16, 17, 18, 11].includes(m.rejection_reason),
  )

  if (user?.is_under_moderation && hasUnresolvedModeration) {
    if (!pathname.startsWith("/moderation")) {
      return <Navigate to='/moderation/' replace />
    }
    return <Outlet />
  }

  if (user && user?.is_onboarded === true && !hasUnresolvedModeration) {
    if (pathname.startsWith("/onboarding")) {
      return <Navigate to='/moderation-splash' replace />
    }
    if (pathname === "/") {
      return <Navigate to='/feed' replace />
    }
    return (
      <div className='h-full flex flex-col relative'>
        <StickyLogo />

        <div className='flex-1 overflow-hidden'>
          <Outlet />
        </div>
        {shouldShowFooter && <PageFooter />}
      </div>
    )
  }

  return <Navigate to='/onboarding' replace />
}
