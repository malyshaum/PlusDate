import { Checkbox, type CheckboxProps } from "@/shared/ui/Checkbox/Checkbox.tsx"
import type { FieldError, FieldValues, Merge, Path, Control } from "react-hook-form"
import { Controller } from "react-hook-form"

export type CheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  error?: FieldError | Merge<FieldError, (FieldError | undefined)[]>
} & Omit<CheckboxProps, "name" | "currentSelections" | "onChange" | "error">

export const CheckboxField = <T extends FieldValues>({
  name,
  control,
  error,
  ...checkboxProps
}: CheckboxFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...checkboxProps}
          name={field.name}
          currentSelections={field.value || []}
          onChange={field.onChange}
          error={error}
        />
      )}
    />
  )
}
