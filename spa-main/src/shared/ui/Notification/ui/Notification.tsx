import { type WithTranslation, withTranslation } from "react-i18next"
import type { ReactNode } from "react"
import classNames from "classnames"

interface Props extends WithTranslation {
  icon: ReactNode
  title: string
  subtitle?: string
  type?: "warning" | "info" | "error"
}

const NotificationBase = ({ t, title, subtitle, icon, type }: Props) => {
  return (
    <div
      className={classNames(
        "flex items-center gap-4 px-4 py-3 border-2  rounded-[8px] mb-2",
        { "bg-[rgba(244,143,55,0.15)] border-[#E67B09]/30": type === "warning" },
        { "bg-notification-error border-accent/30": type === "error" },
      )}
    >
      <div>{icon}</div>
      <div>
        <div className='body-bold'>{t(title)}</div>
        {subtitle && <div className='subtitle-medium mt-1 !normal-case'>{t(subtitle)}</div>}
      </div>
    </div>
  )
}

export const Notification = withTranslation()(NotificationBase)
