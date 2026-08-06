import { apiClient } from "@/lib/api-client";
import type { ActivityLog, AuditLogFilters } from "../types";

interface PaginatedEnvelope<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
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
        page: data.meta.pagination.page,
        perPage: data.meta.pagination.perPage,
        total: data.meta.pagination.total,
        totalPages: data.meta.pagination.totalPages,
      },
    };
  },
};
