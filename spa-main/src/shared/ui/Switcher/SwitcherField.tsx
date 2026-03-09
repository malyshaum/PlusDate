import { Switcher, type SwitcherProps } from "@/shared/ui/Switcher/Switcher.tsx"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Controller } from "react-hook-form"

export type SwitcherFieldProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  onChange?: (value: boolean) => void
} & Omit<SwitcherProps, "value" | "onChange">

export const SwitcherField = <T extends FieldValues>({
  name,
  control,
  onChange: customOnChange,
  ...switcherProps
}: SwitcherFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switcher
          {...switcherProps}
          value={field.value ?? false}
          onChange={(value) => {
            field.onChange(value)
            customOnChange?.(value)
          }}
        />
      )}
    />
  )
}