import { apiClient } from "@/lib/api-client";
import type {
  SendWhatsAppPayload,
  WhatsAppAuditEntry,
  WhatsAppConversation,
  WhatsAppMessage,
} from "../types";

interface ListEnvelope<T> {
  data: T[];
  meta?: Record<string, unknown>;
}
interface ItemEnvelope<T> {
  data: T;
}

/** Typed API calls for the WhatsApp Business inbox (/api/v1/whatsapp). */
export const whatsappService = {
  async conversations(options?: {
    archived?: boolean;
    search?: string;
  }): Promise<WhatsAppConversation[]> {
    const { data } = await apiClient.get<ListEnvelope<WhatsAppConversation>>(
      "/whatsapp/conversations",
      {
        params: {
          archived: options?.archived ? 1 : 0,
          search: options?.search || undefined,
        },
      },
    );
    return data.data;
  },

  async conversation(id: string): Promise<WhatsAppConversation> {
    const { data } = await apiClient.get<ItemEnvelope<WhatsAppConversation>>(
      `/whatsapp/conversations/${id}`,
    );
    return data.data;
  },

  async messages(conversationId: string): Promise<WhatsAppMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<WhatsAppMessage>>(
      `/whatsapp/conversations/${conversationId}/messages`,
    );
    return data.data;
  },

  /**
   * Reply to a thread. Throws ApiError with code `template_required` when the
   * free 24-hour window has closed — the caller must then offer the billable
   * template path explicitly.
   */
  async send(
    conversationId: string,
    payload: SendWhatsAppPayload,
  ): Promise<WhatsAppMessage> {
    const form = new FormData();
    if (payload.body) form.append("body", payload.body);
    if (payload.file) form.append("file", payload.file);

    const { data } = await apiClient.post<ItemEnvelope<WhatsAppMessage>>(
      `/whatsapp/conversations/${conversationId}/messages`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  /** Send the paid re-engagement template to reopen a closed window. */
  async sendTemplate(
    conversationId: string,
    parameters: string[] = [],
  ): Promise<WhatsAppMessage> {
    const { data } = await apiClient.post<ItemEnvelope<WhatsAppMessage>>(
      `/whatsapp/conversations/${conversationId}/template`,
      { parameters },
    );
    return data.data;
  },

  async assign(
    conversationId: string,
    userId: string | null,
  ): Promise<WhatsAppConversation> {
    const { data } = await apiClient.post<ItemEnvelope<WhatsAppConversation>>(
      `/whatsapp/conversations/${conversationId}/assign`,
      { userId },
    );
    return data.data;
  },

  async archive(
    conversationId: string,
    archived: boolean,
  ): Promise<WhatsAppConversation> {
    const { data } = await apiClient.post<ItemEnvelope<WhatsAppConversation>>(
      `/whatsapp/conversations/${conversationId}/archive`,
      { archived },
    );
    return data.data;
  },

  async markRead(conversationId: string): Promise<void> {
    await apiClient.post(`/whatsapp/conversations/${conversationId}/read`, {});
  },

  /**
   * Hide a message from the inbox. Soft only — the row stays in the database
   * and remains visible to admins, by design.
   */
  async hideMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/whatsapp/messages/${messageId}`);
  },

  // ---- Admin oversight ----

  /** Every message a rep has hidden, across all threads. */
  async hiddenMessages(): Promise<WhatsAppMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<WhatsAppMessage>>(
      "/whatsapp/admin/hidden-messages",
    );
    return data.data;
  },

  async restoreMessage(messageId: string): Promise<WhatsAppMessage> {
    const { data } = await apiClient.post<ItemEnvelope<WhatsAppMessage>>(
      `/whatsapp/admin/messages/${messageId}/restore`,
      {},
    );
    return data.data;
  },

  async auditLog(): Promise<WhatsAppAuditEntry[]> {
    const { data } = await apiClient.get<ListEnvelope<WhatsAppAuditEntry>>(
      "/whatsapp/admin/audit-log",
    );
    return data.data;
  },
};
