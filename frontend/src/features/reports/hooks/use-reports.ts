"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { REPORTS_QUERY_KEYS } from "../constants";
import { reportsService } from "../services/reports-service";
import type { ReportData, ReportFilter } from "../types";

export function useReport(filters: ReportFilter) {
  return useQuery<ReportData, ApiError>({
    queryKey: REPORTS_QUERY_KEYS.view(filters),
    queryFn: () => reportsService.get(filters),
    staleTime: 5 * 60 * 1000, // cache reports longer since they are heavier
  });
}

export function useExportReport() {
  return useMutation<void, ApiError, ReportFilter>({
    mutationFn: (filters) => reportsService.download(filters),
    onSuccess: () => {
      toast.success("Report spreadsheet exported successfully.");
    },
    onError: (error) =>
      toast.error(error.message || "Failed to export report."),
  });
}
