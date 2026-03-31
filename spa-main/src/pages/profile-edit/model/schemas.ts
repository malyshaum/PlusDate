import { z } from "zod"
import { nameRegex } from "@/shared/lib/validateName.ts"

export const ProfileEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "validation.name_required" })
    .max(50, { error: "validation.name_long" })
    .regex(nameRegex, { error: "validation.name" }),
  profile_description: z.string().max(255, { error: "validation.description_long" }).optional(),
  instagram: z
    .string()
    .max(30, { error: "validation.instagram" })
    .regex(/^[a-zA-Z0-9._]*$/, { error: "validation.instagram" })
    .regex(/^(?!.*\.\.)/, { error: "validation.instagram" })
    .optional(),
  hide_age: z.boolean().optional(),
})

export type TProfileEdit = z.infer<typeof ProfileEditSchema>
