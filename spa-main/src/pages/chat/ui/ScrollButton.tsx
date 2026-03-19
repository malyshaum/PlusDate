import IconDown from "@/shared/assets/icons/icon-arrow-down-black.svg"
import { motion } from "framer-motion"

interface Props {
  onClick?: () => void
}

export const ScrollButton = ({ onClick }: Props) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className='absolute bottom-[calc(var(--tg-viewport-safe-area-inset-bottom,24px)+60px+var(--safe-padding)+16px)] right-4 z-30 h-[46px] w-[46px] rounded-full bg-white flex items-center justify-center shadow-lg'
      onClick={onClick}
    >
      <img src={IconDown} alt='' />
    </motion.button>
  )
}
