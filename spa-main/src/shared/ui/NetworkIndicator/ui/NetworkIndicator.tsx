import { useEffect, useState } from "react"
import { Snackbar } from "@/widgets/Snackbar"
import styles from "./index.module.css"
import classNames from "classnames"
import { retrieveLaunchParams } from "@tma.js/sdk"
import { withTranslation, type WithTranslation } from "react-i18next"
import { AnimatePresence, motion } from "framer-motion"

const NetworkIndicatorBase = ({ t }: WithTranslation) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator?.onLine ?? true)
  const launchParams = retrieveLaunchParams()
  const { tgWebAppPlatform: platform } = launchParams
  const isIOS = platform === "ios"
  const isAndroid = platform === "android"

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className='fixed bottom-0 h-80 w-full bg-offline-gradient z-100 pointer-events-none'
          />
        )}
      </AnimatePresence>
      <Snackbar
        isOpen={!isOnline}
        onClose={() => {}}
        duration={0}
        className={classNames("!bg-accent-100 border-none z-100 pointer-events-none", {
          "!bottom-18": isIOS,
          "!bottom-15": isAndroid,
        })}
      >
        <div className='flex flex-nowrap items-center gap-2 text-white-100'>
          <div className={styles["spinner"]} />
          <div className='body-bold whitespace-nowrap'>{t("offlineNotice")}</div>
        </div>
      </Snackbar>
    </>
  )
}

export const NetworkIndicator = withTranslation()(NetworkIndicatorBase)
