import { apiClient } from "@/lib/api-client";
import type {
  ChatContact,
  ChatConversation,
  ChatMessage,
  ChatPolicy,
  SendMessagePayload,
} from "../types";

interface ListEnvelope<T> {
  data: T[];
}
interface ItemEnvelope<T> {
  data: T;
}

/** Typed API calls for direct messaging (/api/v1/chat). */
export const chatService = {
  async contacts(): Promise<ChatContact[]> {
    const { data } =
      await apiClient.get<ListEnvelope<ChatContact>>("/chat/contacts");
    return data.data;
  },

  async conversations(): Promise<ChatConversation[]> {
    const { data } = await apiClient.get<ListEnvelope<ChatConversation>>(
      "/chat/conversations",
    );
    return data.data;
  },

  async start(userId: string): Promise<ChatConversation> {
    const { data } = await apiClient.post<ItemEnvelope<ChatConversation>>(
      "/chat/conversations",
      { userId },
    );
    return data.data;
  },

  async messages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
    );
    return data.data;
  },

  async send(
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<ChatMessage> {
    const form = new FormData();
    if (payload.body) form.append("body", payload.body);
    if (payload.file) form.append("file", payload.file);
    const { data } = await apiClient.post<ItemEnvelope<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
      form,
    );
    return data.data;
  },

  async markRead(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/read`, {});
  },

  // ---- Admin ----
  async policies(): Promise<ChatPolicy[]> {
    const { data } = await apiClient.get<ListEnvelope<ChatPolicy>>(
      "/chat/admin/policies",
    );
    return data.data;
  },

  async updatePolicies(
    policies: { role_a: string; role_b: string; allowed: boolean }[],
  ): Promise<ChatPolicy[]> {
    const { data } = await apiClient.put<ListEnvelope<ChatPolicy>>(
      "/chat/admin/policies",
      { policies },
    );
    return data.data;
  },

  async adminConversations(): Promise<ChatConversation[]> {
    const { data } = await apiClient.get<ListEnvelope<ChatConversation>>(
      "/chat/admin/conversations",
    );
    return data.data;
  },

  async adminMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<ChatMessage>>(
      `/chat/admin/conversations/${conversationId}/messages`,
    );
    return data.data;
  },
};
