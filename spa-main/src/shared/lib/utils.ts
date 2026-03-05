export const cleanObject = <T extends object>(
  obj: T,
  keepEmptyFields?: string[]
): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => v !== "" || keepEmptyFields?.includes(k))
  ) as T
}

export const base64ToImageFile = (base64: string, filename: string): File => {
  const arr = base64.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  const extension = mime.includes("png") ? ".png" : ".jpg"
  const finalFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`

  return new File([u8arr], finalFilename, { type: mime })
}
