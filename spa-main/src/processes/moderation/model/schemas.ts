import { z } from "zod"
import {
  createFileImageRules,
  createFileVideoRules,
  createOptionalFileImageRules,
} from "@/shared/validations/zod.ts"
import { nameRegex } from "@/shared/lib/validateName.ts"

export const MediaInfoSchema = z.object({
  photo1: createOptionalFileImageRules(),
  photo2: createOptionalFileImageRules(),
  photo3: createOptionalFileImageRules(),
  videos: createFileVideoRules(),
})

export const VerificationInfoSchema = z.object({
  verification_photo: createFileImageRules(),
})

export type TMediaInfo = z.infer<typeof MediaInfoSchema>
export type TVerificationInfo = z.infer<typeof VerificationInfoSchema>

export const ModerationReplacementSchema = z.record(z.string(), z.instanceof(File).optional())

export type TModerationReplacement = z.infer<typeof ModerationReplacementSchema>

export const ModerationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "validation.name_required" })
    .max(50, { message: "validation.name_long" })
    .regex(nameRegex, { message: "validation.name" }),
  profile_description: z.string().max(255, { message: "validation.description_long" }).optional(),
  instagram: z
    .string()
    .max(30, { message: "validation.instagram" })
    .regex(/^[a-zA-Z0-9._]*$/, { message: "validation.instagram" })
    .regex(/^(?!.*\.\.)/, { message: "validation.instagram" })
    .optional(),
  photos: z.record(z.string(), z.instanceof(File).optional()).optional(),
})

export type TModerationForm = z.infer<typeof ModerationFormSchema>
