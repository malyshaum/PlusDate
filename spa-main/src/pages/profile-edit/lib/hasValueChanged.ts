import type { IUser } from "@/entities/user/model/types.ts"
import type { TProfileEdit } from "../model/schemas.ts"

export const hasValueChanged = (
  field: keyof TProfileEdit,
  value: string | boolean | undefined,
  user?: IUser,
) => {
  if (value === undefined) return true

  // Only check for specific text fields
  const textFields = ["name", "profile_description", "instagram"]
  if (textFields.includes(field) && typeof value === "string") {
    const currentValue = user?.[field as keyof typeof user]

    // Normalize values: empty string should equal null
    const normalizedValue = value.trim() === "" ? null : value
    const normalizedCurrentValue =
      currentValue === null || currentValue === "" ? null : currentValue

    return normalizedValue !== normalizedCurrentValue
  }

  // For other fields (boolean settings, etc.), always allow the update
  return true
}
