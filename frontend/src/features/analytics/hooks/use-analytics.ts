"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http-error";
import { ANALYTICS_QUERY_KEYS } from "../constants";
import { analyticsService } from "../services/analytics-service";
import type { AnalyticsData } from "../types";

export function useAnalytics() {
  return useQuery<AnalyticsData, ApiError>({
    queryKey: ANALYTICS_QUERY_KEYS.dashboard(),
    queryFn: () => analyticsService.get(),
    staleTime: 5 * 60 * 1000, // cache dashboard stats for 5 mins
  });
}
