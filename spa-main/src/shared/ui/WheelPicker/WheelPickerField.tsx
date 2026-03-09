import { type Control, Controller, type FieldValues, type Path } from "react-hook-form"

import {
  CustomWheelPicker,
  type CustomWheelPickerProps,
} from "@/shared/ui/WheelPicker/WheelPicker.tsx"

interface WheelPickerFieldProps<T extends FieldValues>
  extends Omit<CustomWheelPickerProps, "value" | "onChange"> {
  name: Path<T>
  control: Control<T>
}

export function WheelPickerField<T extends FieldValues>({
  name,
  control,
  ...props
}: WheelPickerFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <CustomWheelPicker {...props} value={value || ""} onChange={onChange} />
      )}
    />
  )
}
