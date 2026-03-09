import { Input, type InputProps } from "@/shared/ui/Input/Input.tsx"

import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form"
export type InputFieldProps<T extends FieldValues> = {
  name: Path<T>
  register: UseFormRegister<T>
  error?: FieldError
} & Omit<InputProps, "name" | "value" | "onChange" | "onBlur" | "errorMessage">

export const InputField = <T extends FieldValues>({
  name,
  register,
  error,
  ...inputProps
}: InputFieldProps<T>) => {
  const { ref: hookFormRef, ...registerProps } = register(name)

  return (
    <Input
      {...inputProps}
      {...registerProps}
      ref={hookFormRef}
      error={error}
      aria-invalid={error ? "true" : "false"}
    />
  )
}
