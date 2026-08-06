import { apiClient } from "@/lib/api-client";
import type {
  EmailAuditEntry,
  EmailInboxMeta,
  EmailMessage,
  EmailThread,
  SendEmailPayload,
} from "../types";

interface ListEnvelope<T> {
  data: T[];
  meta?: Record<string, unknown>;
}
interface ItemEnvelope<T> {
  data: T;
}

/** Typed API calls for the shared email inbox (/api/v1/email). */
export const emailService = {
  /** Threads plus mailbox health, which the list header surfaces. */
  async threads(options?: {
    archived?: boolean;
    search?: string;
  }): Promise<{ threads: EmailThread[]; meta: EmailInboxMeta }> {
    const { data } = await apiClient.get<ListEnvelope<EmailThread>>(
      "/email/threads",
      {
        params: {
          archived: options?.archived ? 1 : 0,
          search: options?.search || undefined,
        },
      },
    );

    const meta = (data.meta ?? {}) as Partial<EmailInboxMeta>;

    return {
      threads: data.data,
      meta: {
        configured: Boolean(meta.configured),
        mailbox: meta.mailbox ?? null,
        lastSyncedAt: meta.lastSyncedAt ?? null,
        lastError: meta.lastError ?? null,
      },
    };
  },

  async thread(id: string): Promise<EmailThread> {
    const { data } = await apiClient.get<ItemEnvelope<EmailThread>>(
      `/email/threads/${id}`,
    );
    return data.data;
  },

  async messages(threadId: string): Promise<EmailMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<EmailMessage>>(
      `/email/threads/${threadId}/messages`,
    );
    return data.data;
  },

  async send(
    threadId: string,
    payload: SendEmailPayload,
  ): Promise<EmailMessage> {
    const form = new FormData();
    form.append("body", payload.body);
    (payload.files ?? []).forEach((f) => form.append("files[]", f));

    const { data } = await apiClient.post<ItemEnvelope<EmailMessage>>(
      `/email/threads/${threadId}/messages`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  async assign(threadId: string, userId: string | null): Promise<EmailThread> {
    const { data } = await apiClient.post<ItemEnvelope<EmailThread>>(
      `/email/threads/${threadId}/assign`,
      { userId },
    );
    return data.data;
  },

  async archive(threadId: string, archived: boolean): Promise<EmailThread> {
    const { data } = await apiClient.post<ItemEnvelope<EmailThread>>(
      `/email/threads/${threadId}/archive`,
      { archived },
    );
    return data.data;
  },

  async markRead(threadId: string): Promise<void> {
    await apiClient.post(`/email/threads/${threadId}/read`, {});
  },

  /**
   * Hide a message from the inbox. Soft only — the row stays in the database
   * and remains visible to admins, by design.
   */
  async hideMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/email/messages/${messageId}`);
  },

  // ---- Admin oversight ----

  async hiddenMessages(): Promise<EmailMessage[]> {
    const { data } = await apiClient.get<ListEnvelope<EmailMessage>>(
      "/email/admin/hidden-messages",
    );
    return data.data;
  },

  async restoreMessage(messageId: string): Promise<EmailMessage> {
    const { data } = await apiClient.post<ItemEnvelope<EmailMessage>>(
      `/email/admin/messages/${messageId}/restore`,
      {},
    );
    return data.data;
  },

  async auditLog(): Promise<EmailAuditEntry[]> {
    const { data } = await apiClient.get<ListEnvelope<EmailAuditEntry>>(
      "/email/admin/audit-log",
    );
    return data.data;
  },
};
