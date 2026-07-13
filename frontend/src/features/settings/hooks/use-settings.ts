"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { settingsService } from "../services/settings-service";
import type { SystemSettings } from "../types";

export const SETTINGS_QUERY_KEYS = {
  all: ["system-settings"] as const,
};

export function useSettings() {
  return useQuery<SystemSettings, ApiError>({
    queryKey: SETTINGS_QUERY_KEYS.all,
    queryFn: () => settingsService.get(),
    staleTime: 5 * 60 * 1000, // Caching settings values
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<SystemSettings, ApiError, SystemSettings>({
    mutationFn: (payload) => settingsService.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.all, data);
      toast.success("Settings updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to save settings."),
  });
}
