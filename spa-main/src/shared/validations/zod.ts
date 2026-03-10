import { z } from "zod"
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
} from "@/shared/const/constants.ts"

export const createFileImageRules = () =>
  z
    .instanceof(File, { error: "validation.required" })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      error: "validation.image_type_invalid",
    })
    .refine((file) => file.size <= MAX_IMAGE_FILE_SIZE, {
      error: "validation.image_size_too_large",
    })

export const createOptionalFileImageRules = () =>
  z
    .instanceof(File, { error: "validation.required" })
    .or(z.undefined())
    .refine(
      (file) => {
        if (!file) return false
        return ACCEPTED_IMAGE_TYPES.includes(file.type)
      },
      { error: "validation.image_type_invalid" },
    )
    .refine(
      (file) => {
        if (!file) return false
        return file.size <= MAX_IMAGE_FILE_SIZE
      },
      { error: "validation.image_size_too_large" },
    )

export const createFileVideoRules = () =>
  z
    .union([
      z
        .instanceof(File)
        .refine((file) => ACCEPTED_VIDEO_TYPES.includes(file.type), {
          error: "validation.video_type_invalid",
        })
        .refine((file) => file.size <= MAX_VIDEO_FILE_SIZE, {
          error: "validation.video_size_too_large",
        }),
      z.null(),
      z.undefined(),
    ])
    .optional()
