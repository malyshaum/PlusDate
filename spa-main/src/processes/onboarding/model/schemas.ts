import { z } from "zod"
import {
  createFileImageRules,
  createFileVideoRules,
  createOptionalFileImageRules,
} from "@/shared/validations/zod.ts"
import { nameRegex } from "@/shared/lib/validateName.ts"
import type { IUserFile } from "@/entities/user/model/types.ts"

export type SlotState =
  | { type: "server"; file: IUserFile }
  | {
      type: "local"
      objectUrl: string
      status: "uploading" | "success" | "error"
      fileName: string
      fileSize: number
      fileLastModified: number
    }
  | { type: "empty" }

export const BasicInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "validation.name_required" })
    .max(50, { error: "validation.name_long" })
    .regex(nameRegex, { error: "validation.name" }),
  instagram: z
    .string()
    .max(30, { error: "validation.instagram" })
    .regex(/^[a-zA-Z0-9._]*$/, { error: "validation.instagram" })
    .regex(/^(?!.*\.\.)/, { error: "validation.instagram" })
    .optional(),
  sex: z
    .enum(["male", "female", ""], { error: "validation.sex_required" })
    .refine((val) => val !== "", { error: "validation.sex_required" }),
})

export const AgeInfoSchema = z.object({
  age: z.string(),
})

export const CityInfoSchema = z.object({
  city_id: z.number().min(1, { error: "validation.city_required" }),
  en_country_name: z.string(),
  en_name: z.string(),
  ru_country_name: z.string(),
  ru_name: z.string(),
})

export const InterestInfoSchema = z.object({
  search_for: z.enum(["relations", "friends", "no_answer"], {
    error: "validation.search_for_required",
  }),
  profile_description: z.string().max(255, { error: "validation.description_long" }).optional(),
  hobbies: z.array(z.number()).max(5),
})

export const MediaInfoSchema = z
  .object({
    photo1: createOptionalFileImageRules(),
    photo2: createOptionalFileImageRules(),
    photo3: createOptionalFileImageRules(),
    videos: createFileVideoRules(),
  })
  .superRefine((data, ctx) => {
    const photoFields = [
      { key: "photo1" as const, file: data.photo1 },
      { key: "photo2" as const, file: data.photo2 },
      { key: "photo3" as const, file: data.photo3 },
    ]
    const photos = photoFields.filter((p) => p.file)

    if (photos.length < 2) return

    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        if (
          photos[i].file!.name === photos[j].file!.name &&
          photos[i].file!.size === photos[j].file!.size &&
          photos[i].file!.lastModified === photos[j].file!.lastModified
        ) {
          ctx.addIssue({
            code: "custom",
            message: "validation.duplicate_photos",
            path: [photos[j].key],
          })
        }
      }
    }
  })

export const VerificationInfoSchema = z.object({
  verification_photo: createFileImageRules(),
})

export type TBasicInfo = z.infer<typeof BasicInfoSchema>
export type TAgeInfo = z.infer<typeof AgeInfoSchema>
export type TCityInfo = z.infer<typeof CityInfoSchema>
export type TInterests = z.infer<typeof InterestInfoSchema>
export type TMediaInfo = z.infer<typeof MediaInfoSchema>
export type TVerificationInfo = z.infer<typeof VerificationInfoSchema>
