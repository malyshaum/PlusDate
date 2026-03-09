import { useEffect, useState } from "react"

export interface Props {
  file: File | null
}

const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const videoUrl = URL.createObjectURL(file)

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      video.currentTime = Math.min(1, video.duration * 0.1)
    })

    video.addEventListener("seeked", () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob)
            resolve(thumbnailUrl)
          } else {
            reject(new Error("Could not generate thumbnail"))
          }

          URL.revokeObjectURL(videoUrl)
        },
        "image/jpeg",
        0.8,
      )
    })

    video.addEventListener("error", () => {
      URL.revokeObjectURL(videoUrl)
      reject(new Error("Could not load video"))
    })

    video.src = videoUrl
    video.load()
  })
}

export const VideoPreview = ({ file }: Props) => {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      void generateVideoThumbnail(file).then((url) => {
        setPreview(url)
      })
    }
  }, [file])

  if (!file) {
    return null
  }

  return <>{preview && <img src={preview} alt='video-preview' />}</>
}
