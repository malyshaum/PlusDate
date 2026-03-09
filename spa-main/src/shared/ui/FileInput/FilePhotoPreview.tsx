import { useEffect, useState } from "react"

export const PhotoPreview = ({
  file,
  alt,
  className,
}: {
  file: File
  alt: string
  className: string
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    return () => {
      setPreviewUrl(null)
    }
  }, [file])

  if (!previewUrl) {
    return <div className={className} />
  }

  return <img src={previewUrl} alt={alt} className={className} />
}
