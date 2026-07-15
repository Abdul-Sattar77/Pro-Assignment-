import { apiClient } from "@/lib/api-client";
import type { Conversation, Message, SendMessagePayload } from "../types";

interface Envelope<T> {
  data: T;
}

export const messageService = {
  async listConversations(search?: string, type?: string): Promise<Conversation[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (type) params.type = type;

    const { data } = await apiClient.get<Envelope<Conversation[]>>("/messages", {
      params,
    });
    return data.data;
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    const { data } = await apiClient.get<Envelope<Message[]>>(
      `/messages/${conversationId}`
    );
    return data.data;
  },

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const { data } = await apiClient.post<Envelope<Message>>("/messages", payload);
    return data.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>(
      "/messages/unread-count"
    );
    return data.count;
  },
};
