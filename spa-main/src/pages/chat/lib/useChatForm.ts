import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const chatMessageSchema = z.object({
  content: z.string().max(1000, "Message cannot exceed 1000 characters"),
})

export type ChatMessageForm = z.infer<typeof chatMessageSchema>

export const useChatForm = () => {
  const form = useForm<ChatMessageForm>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { content: "" },
  })

  return {
    ...form,
    messageText: form.watch("content"),
  }
}