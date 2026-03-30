import { z } from "zod"

export const Schema = z.object({
  reasons: z.array(z.string()).max(6),
  note: z
    .string()
    .min(50, { message: "validation.note_min_50" })
    .max(120, { message: "validation.description_long_120" }),
})

export type TSchema = z.infer<typeof Schema>
