import { Selector, type SelectorProps } from "@/shared/ui/Selector/Selector.tsx"
import type { FieldError, FieldValues, Path, Control } from "react-hook-form"
import { Controller } from "react-hook-form"

export type SelectorFieldProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  error?: FieldError
} & Omit<SelectorProps, "name" | "value" | "onChange" | "error">

export const SelectorField = <T extends FieldValues>({
  name,
  control,
  error,
  ...selectorProps
}: SelectorFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Selector
          {...selectorProps}
          name={field.name}
          value={field.value || ""}
          onChange={field.onChange}
          error={error}
        />
      )}
    />
  )
}
