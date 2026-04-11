import { z } from "zod"

export const Schema = z
  .object({
    reason_code: z.string().min(1),
    custom_text: z.string().max(120).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.reason_code === "other") {
        return data.custom_text && data.custom_text.trim().length > 0
      }
      return true
    },
    {
      message: "validation.custom_text_required",
      path: ["custom_text"],
    },
  )

export type TSchema = z.infer<typeof Schema>
