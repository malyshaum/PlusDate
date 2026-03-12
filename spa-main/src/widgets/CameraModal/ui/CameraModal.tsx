import { useRef, useCallback, useState, useEffect } from "react"
import Webcam from "react-webcam"
import FlashOff from "@/shared/assets/icons/flash-off.svg?react"
import FlashOn from "@/shared/assets/icons/flash-on.svg?react"
import { Button } from "@/shared/ui"
import { useTelegramBackButton } from "@/shared/lib/useTelegramBackButtonVisibility"
import { useHapticFeedback } from "@/shared/lib/useHapticFeedback.tsx"
interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageBase64: string) => void
  videoConstraints?: MediaTrackConstraints
}
export const CameraModal = ({
  isOpen,
  onClose,
  onCapture,
  videoConstraints = {
    width: 120,
    height: 720,
    facingMode: "user",
  },
}: CameraModalProps) => {
  const webcamRef = useRef<Webcam>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const { triggerImpact } = useHapticFeedback()
  useTelegramBackButton(isOpen, onClose)
  const handleCameraError = useCallback((error: string | DOMException) => {
    setCameraError(typeof error === "string" ? error : "Camera access denied")
  }, [])

  const capture = useCallback(() => {
    if (webcamRef.current) {
      triggerImpact()
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        onCapture(imageSrc)
        onClose()
      }
    }
  }, [webcamRef, onCapture, onClose, triggerImpact])

  const handleRetry = useCallback(() => {
    triggerImpact()
    setCameraError(null)
  }, [triggerImpact, setCameraError])

  useEffect(() => {
    if (!isOpen) setShowFlash(false)
  }, [isOpen])
  const handleFlash = useCallback(async () => {
    triggerImpact()
    setShowFlash((showFlash) => !showFlash)
    const stream = webcamRef.current?.video?.srcObject as MediaStream | undefined
    const track = stream?.getVideoTracks?.()[0]
    const caps = (track?.getCapabilities?.() || {}) as MediaTrackCapabilities & { torch?: boolean }
    if (track && caps.torch) {
      await track.applyConstraints({ advanced: [{ torch: true }] })
      setTimeout(async () => {
        await track.applyConstraints({ advanced: [{ torch: false }] })
      }, 300)
    }
  }, [triggerImpact])
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 z-50 h-full w-full bg-dark-100 flex flex-col justify-center items-center pb-safe-area-bottom-with-button'>
      <div className='relative w-full h-full'>
        <div className='relative w-full h-12 px-4'>
          <div className='z-50 flex justify-end h-full items-center'>
            <button
              type='button'
              onClick={handleFlash}
              className={`w-8 h-8 rounded-md flex items-center justify-center`}
              aria-label='Flash'
            >
              {showFlash ? <FlashOn /> : <FlashOff />}
            </button>
          </div>
        </div>
        {cameraError ? (
          <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
            <p className='text-white mb-4'>{cameraError}</p>
            <Button type='button' size='S' appearance='white' onClick={handleRetry}>
              Try again
            </Button>
          </div>
        ) : (
          <div className='relative w-full h-full'>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat='image/jpeg'
              videoConstraints={videoConstraints}
              onUserMediaError={handleCameraError}
              mirrored={true}
              screenshotQuality={1}
              className='w-full h-full object-cover'
            />
            {showFlash && (
              <div className='absolute inset-0 z-40 pointer-events-none'>
                <div
                  style={{
                    background: "white",
                    opacity: 0.7,
                    width: "100%",
                    height: "100%",
                    transition: "opacity 220ms ease-out",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {!cameraError && (
        <div className='w-full h-44 absolute bottom-0 bg-black z-60'>
          <div
            className='absolute bottom-10 left-[50%] translate-x-[-50%] rounded-full border border-white-100 p-2 flex items-center justify-center z-20'
            style={{ bottom: "calc(var(--tg-viewport-safe-area-inset-bottom, 40px) + 30px)" }}
          >
            <button
              type='button'
              onClick={capture}
              className='w-16 h-16 bg-white-100 rounded-full active:scale-95 transition-transform'
            />
          </div>
        </div>
      )}
    </div>
  )
}
