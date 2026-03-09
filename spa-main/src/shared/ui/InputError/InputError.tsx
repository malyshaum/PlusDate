import type { FieldError, Merge } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface Props {
  error?: FieldError | Merge<FieldError, (FieldError | undefined)[] | string>
}

export const InputError = ({ error }: Props) => {
  const { t } = useTranslation()

  if (!error?.message) return null

  const getMessage = () => {
    if (error.message?.startsWith("validation.")) {
      return t(error.message)
    }
    return error.message
  }

  return (
    <p className='mt-1 caption1-medium text-attention' role='alert'>
      {getMessage()}
    </p>
  )
}
