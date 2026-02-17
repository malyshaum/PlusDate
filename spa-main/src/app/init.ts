import {
  init,
  mockTelegramEnv,
  type ThemeParams,
  themeParams,
  retrieveLaunchParams,
  emitEvent,
  viewport,
  closingBehavior,
  requestWriteAccess,
  locationManager,
  backButton,
  swipeBehavior,
  postEvent,
  miniApp,
} from "@tma.js/sdk-react"

export async function initTgSDK(options: {
  debug: boolean
  mockForMacOS: boolean
  platform: string
}): Promise<void> {
  // setDebug(options.debug)

  // Telegram for macOS has bugs with theme and safe area requests
  // IMPORTANT: mockTelegramEnv must be called BEFORE init()
  if (options.mockForMacOS) {
    let firstThemeSent = false
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === "web_app_request_theme") {
          let tp: ThemeParams = {}
          if (firstThemeSent) {
            tp = themeParams.state()
          } else {
            firstThemeSent = true
            tp ||= retrieveLaunchParams().tgWebAppThemeParams
          }
          return emitEvent("theme_changed", { theme_params: tp })
        }

        if (event.name === "web_app_request_safe_area") {
          return emitEvent("safe_area_changed", { left: 0, top: 0, right: 0, bottom: 0 })
        }

        next()
      },
    })
  }

  init()

  // Skip viewport on macOS/tdesktop - Known bug: https://github.com/Telegram-Mini-Apps/tma.js/issues/694
  if (options.platform !== "macos" && options.platform !== "tdesktop") {
    if (viewport.mount.isAvailable()) {
      try {
        await viewport.mount()
        if (viewport.requestFullscreen.isAvailable()) {
          await viewport.requestFullscreen()
        }
      } catch (err) {
        console.error("Viewport mount error:", err)
      }
    }
  }

  if (miniApp.mount.isAvailable()) {
    miniApp.mount()
  }

  if (miniApp.setBgColor.isAvailable()) {
    miniApp.setBgColor("#000000")
  }

  if (viewport.bindCssVars.isAvailable()) {
    viewport.bindCssVars()
  }

  try {
    postEvent("web_app_toggle_orientation_lock", { locked: true })
  } catch (err) {
    console.log("Orientation lock not available:", err)
  }

  if (closingBehavior.mount.isAvailable()) {
    closingBehavior.mount()
    if (closingBehavior.enableConfirmation.isAvailable()) {
      closingBehavior.enableConfirmation()
    }
  }

  const requestAccessRecursively = async (): Promise<void> => {
    if (requestWriteAccess.isAvailable()) {
      const granted = await requestWriteAccess()
      if (granted) {
        console.log("Write access granted")
      } else {
        console.log("Write access denied")
      }
    }
  }

  try {
    await requestAccessRecursively()
  } catch (err) {
    console.error("Write access request failed:", err)
  }

  if (locationManager.mount.isAvailable()) {
    try {
      await locationManager.mount()
    } catch (err) {
      console.log("Location manager error:", err)
    }
  }

  if (backButton.mount.isAvailable()) {
    backButton.mount()
  }

  if (swipeBehavior.mount.isAvailable()) {
    swipeBehavior.mount()
    if (swipeBehavior.disableVertical.isAvailable()) {
      swipeBehavior.disableVertical()
    }
  }
}
