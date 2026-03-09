import { AudioIconState } from "@/shared/lib/useVideoSoundToggle"
import Mute from "@/shared/assets/icons/mute-ic.svg?react"
import Unmute from "@/shared/assets/icons/unmute-ic.svg?react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  handleMuteToggle: () => void
  isIconVisible: boolean
  toggleStatus: AudioIconState | null
}

export const VideoSoundLayout = ({ isIconVisible, toggleStatus, handleMuteToggle }: Props) => {
  return (
    <>
      <div
        className='absolute h-full w-[50%] left-[25%] top-0 bottom-0 bg-transparent z-10 cursor-pointer'
        onClick={handleMuteToggle}
      />
      <AnimatePresence>
        {isIconVisible && (
          <motion.div
            key={toggleStatus ?? "icon"}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none'
          >
            <motion.div className='bg-black/35 backdrop-blur-sm p-4 rounded-full flex items-center justify-center'>
              {toggleStatus === AudioIconState.On ? (
                <Unmute width={28} height={28} />
              ) : (
                <Mute width={28} height={28} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
