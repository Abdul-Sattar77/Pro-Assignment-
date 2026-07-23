import { apiClient } from "@/lib/api-client";
import type { ReportData, ReportFilter } from "../types";

interface Envelope {
  data: ReportData;
}

export const reportsService = {
  async get(filters: ReportFilter): Promise<ReportData> {
    const params: Record<string, string> = { type: filters.type };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const { data } = await apiClient.get<Envelope>("/reports", {
      params,
    });
    return data.data;
  },

  async download(filters: ReportFilter): Promise<void> {
    const params: Record<string, string> = { type: filters.type };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const { data } = await apiClient.get("/reports/export", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([data], { type: "text/csv; charset=UTF-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${filters.type}-report-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadExcel(filters: ReportFilter): Promise<void> {
    const params: Record<string, string> = { type: filters.type, format: "xlsx" };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const { data } = await apiClient.get("/reports/export", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([data], {
      type: "application/vnd.ms-excel; charset=UTF-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${filters.type}-report-${new Date().toISOString().split("T")[0]}.xls`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
