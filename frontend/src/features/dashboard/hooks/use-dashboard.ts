"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { dashboardService } from "../services/dashboard-service";

export const DASHBOARD_QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
};

export function useDashboardStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: () => dashboardService.getStats(),
    // Only fetch once the session is confirmed — prevents a 401 race on mount
    // that would clear the Sanctum token from localStorage and block all APIs.
    enabled: isAuthenticated,
    // Keep cached data valid for 2 minutes — UI renders immediately from cache
    // on every revisit without a full loading spinner.
    staleTime: 2 * 60 * 1000,
    // Silently refresh in the background every 60 seconds.
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    // Don't retry — a real 401/403 here means the session is invalid.
    retry: false,
  });
}
