import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type { Message } from "../types";

interface ListEnvelope {
  data: Message[];
}
interface ItemEnvelope {
  data: Message;
}

/** Typed API calls for an order's chat thread. */
export const messagesService = {
  async list(assignmentId: string): Promise<Message[]> {
    const { data } = await apiClient.get<ListEnvelope>(
      `/assignments/${assignmentId}/messages`,
    );
    return data.data;
  },

  async send(assignmentId: string, body: string): Promise<Message> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${assignmentId}/messages`,
      { body },
    );
    return data.data;
  },
};
