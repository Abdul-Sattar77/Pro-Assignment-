import type { AuditLogFilters } from "../types";

export const AUDIT_LOGS_QUERY_KEYS = {
  all: ["audit-logs"] as const,
  list: (filters: AuditLogFilters) => ["audit-logs", "list", filters] as const,
};
