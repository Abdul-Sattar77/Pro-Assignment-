import { apiClient } from "@/lib/api-client";
import type { ActivityLog, AuditLogFilters } from "../types";

interface PaginatedEnvelope<T> {
  data: T;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const auditLogsService = {
  async list(filters: AuditLogFilters) {
    const params: Record<string, string | number> = {};
    if (filters.logName) params.log_name = filters.logName;
    if (filters.causerId) params.causer_id = filters.causerId;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;

    const { data } = await apiClient.get<PaginatedEnvelope<ActivityLog[]>>(
      "/audit-logs",
      {
        params,
      },
    );

    return {
      logs: data.data,
      pagination: {
        page: data.meta.current_page,
        perPage: data.meta.per_page,
        total: data.meta.total,
        totalPages: data.meta.last_page,
      },
    };
  },
};
