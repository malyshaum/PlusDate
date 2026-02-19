import type {
  IChatResponse,
  IMessagesResponse,
  ISendMessageRequest,
  IReadMessagesRequest,
  IMessage,
  IChatRecentResponse,
} from "@/entities/chats/model/types"
import api from "@/shared/api/instance.api.ts"

export const fetchChats = async (cursor?: string): Promise<IChatResponse> => {
  return api.get("/chat", { params: { cursor: cursor } })
}

export const fetchChatMessages = async (
  chatId: string | number,
  cursor?: string,
): Promise<IMessagesResponse> => {
  return api.get(`/chat/${chatId}/message`, { params: { cursor, per_page: 50 } })
}

export const sendMessage = async (data: ISendMessageRequest): Promise<IMessage> => {
  return api.post("/chat/message", data)
}

export const readMessages = async (data: IReadMessagesRequest) => {
  return api.put("/chat/message", data)
}

export const fetchRecentChats = async (cursor?: string): Promise<IChatRecentResponse> => {
  return api.get("/chat/recent", { params: { cursor: cursor } })
}
