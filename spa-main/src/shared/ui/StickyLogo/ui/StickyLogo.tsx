import IconStickyLogo from "@/shared/assets/icons/icon-logo-sticky.svg"
import styles from "../styles/styles.module.css"

export const StickyLogo = () => {
  return (
    <div className={styles.stickyLogo}>
      <img src={IconStickyLogo} alt='Logo' />
    </div>
  )
}
