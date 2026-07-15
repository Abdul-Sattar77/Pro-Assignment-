"use client";

import { useQuery } from "@tanstack/react-query";
import { AUDIT_LOGS_QUERY_KEYS } from "../constants";
import { auditLogsService } from "../services/audit-logs-service";
import type { AuditLogFilters } from "../types";

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEYS.list(filters),
    queryFn: () => auditLogsService.list(filters),
    staleTime: 10 * 1000,
  });
}
