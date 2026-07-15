import { apiClient } from "@/lib/api-client";
import type { AnalyticsData } from "../types";

interface Envelope {
  data: AnalyticsData;
}

export const analyticsService = {
  async get(): Promise<AnalyticsData> {
    const { data } = await apiClient.get<Envelope>("/analytics");
    return data.data;
  },
};
