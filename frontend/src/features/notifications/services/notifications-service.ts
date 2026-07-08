import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type { AppNotification } from "../types";

interface ListEnvelope {
  data: AppNotification[];
}
interface CountEnvelope {
  data: { count: number };
}

/** Typed API calls for in-app notifications. */
export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<ListEnvelope>("/notifications");
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<CountEnvelope>(
      "/notifications/unread-count",
    );
    return data.data.count;
  },

  async markRead(id: string): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.post("/notifications/read-all");
  },
};
