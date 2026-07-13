import { apiClient } from "@/lib/api-client";
import type { SystemSettings } from "../types";

interface Envelope<T> {
  data: T;
}

export const settingsService = {
  async get(): Promise<SystemSettings> {
    const { data } = await apiClient.get<Envelope<SystemSettings>>("/settings");
    return data.data;
  },

  async update(payload: SystemSettings): Promise<SystemSettings> {
    const { data } = await apiClient.put<Envelope<SystemSettings>>("/settings", payload);
    return data.data;
  },
};
