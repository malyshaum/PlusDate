import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { GoogleTagManagerProvider } from "@tracktor/react-google-tag-manager"
import App from "./App.tsx"
import "./localization/i18n"
import { initTgSDK } from "@/app/init.ts"
import { AuthProvider } from "@/app/providers/AuthProvider.tsx"
import { SocketProvider } from "@/app/providers/SocketProvider.tsx"
import { ErrorBoundary } from "@/app/providers/ErrorBoundary.tsx"
import { PaymentProvider } from "@/app/providers/PaymentProvider.tsx"
import { MaintenanceProvider } from "@/app/providers/MaintenanceProvider.tsx"
import { env } from "@/shared/config/env.ts"
import Cookies from "js-cookie"
import { login, me } from "@/entities/user/api/user.api.ts"
import { USER_KEYS } from "@/entities/user/api/queries.ts"

type TgLaunchParams = {
  tgWebAppPlatform?: string
  tgWebAppStartParam?: string
  tgWebAppThemeParams?: Record<string, unknown>
  [key: string]: unknown
}

async function safeLoginAndPrefetchUser(
  initData: string | null | undefined,
  queryClient: QueryClient,
) {
  if (env.maintenanceMode) return

  try {
    if (initData) {
      const res = await login({ query: initData })

      if (res?.token) {
        Cookies.set("auth_token", res.token)
        const user = await me()
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({ campaign_id: user.start_param || "direct", user_id: user.id })
        queryClient.setQueryData([USER_KEYS.user, USER_KEYS.me], user)
        return
      }

      if (res?.message) {
        Cookies.remove("auth_token")
        sessionStorage.setItem("account.deleted", "true")
        return
      }
    }

    if (Cookies.get("auth_token")) {
      const user = await me()
      queryClient.setQueryData([USER_KEYS.user, USER_KEYS.me], user)
    }
  } catch (error) {
    console.error("Login / user prefetch failed:", error)
  }
}

if (import.meta.env.VITE_MODE === "testing") {
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/eruda"
  script.onload = () => {
    // @ts-expect-error - eruda is loaded dynamically
    window.eruda?.init({
      defaults: {
        displaySize: 50,
        transparency: 0.9,
      },
    })
  }
  document.head.appendChild(script)
}
try {
  let retrieveLaunchParams: (() => TgLaunchParams) | undefined
  let retrieveRawInitData: () => string | undefined = () => undefined

  try {
    const sdk = await import("@tma.js/sdk-react")
    retrieveLaunchParams = sdk.retrieveLaunchParams ?? retrieveLaunchParams
    retrieveRawInitData = sdk.retrieveRawInitData ?? retrieveRawInitData
  } catch (e) {
    console.warn("Telegram SDK not available (dynamic import failed), continuing without it:", e)
  }

  let launchParams: TgLaunchParams = {} as TgLaunchParams
  let initData: string | null | undefined = null

  try {
    launchParams = retrieveLaunchParams?.() || {}
  } catch (e) {
    console.warn("retrieveLaunchParams() threw, using fallback:", e)
    launchParams = {}
  }

  try {
    initData = retrieveRawInitData()
  } catch (e) {
    console.warn("retrieveRawInitData() threw, using fallback:", e)
    initData = null
  }

  const { tgWebAppPlatform: platform = "" } = launchParams || {}

  if (platform === "android") {
    document.documentElement.style.setProperty("--safe-padding", "24px")
  } else {
    document.documentElement.style.setProperty("--safe-padding", "0px")
  }

  const debug =
    (launchParams?.tgWebAppStartParam || "").includes("platformer_debug") || import.meta.env.DEV

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        refetchOnMount: false,
        networkMode: "online",
      },
      mutations: {
        retry: false,
      },
    },
  })

  void initTgSDK({
    debug,
    mockForMacOS: platform === "macos",
    platform,
  }).catch((error) => {
    console.error("Telegram SDK init failed:", error)
  })

  void safeLoginAndPrefetchUser(initData, queryClient)

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => console.error("Service worker registration failed:", error))
    })
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <MaintenanceProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <SocketProvider>
                  <PaymentProvider>
                    <GoogleTagManagerProvider id={env.gtm_token}>
                      <App />
                    </GoogleTagManagerProvider>
                  </PaymentProvider>
                </SocketProvider>
              </AuthProvider>
            </QueryClientProvider>
          </MaintenanceProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (e) {
  console.error(e)
  // TODO logger
}
