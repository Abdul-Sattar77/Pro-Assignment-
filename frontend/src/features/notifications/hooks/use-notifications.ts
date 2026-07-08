"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http-error";
import { notificationsService } from "../services/notifications-service";
import type { AppNotification } from "../types";

const KEYS = {
  list: ["notifications", "list"] as const,
  unread: ["notifications", "unread"] as const,
};

/** Unread badge count — polls every 20s (realtime-ready). */
export function useUnreadCount() {
  return useQuery<number, ApiError>({
    queryKey: KEYS.unread,
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 20000,
  });
}

/** Recent notifications — fetched when the bell opens. */
export function useNotifications(enabled: boolean) {
  return useQuery<AppNotification[], ApiError>({
    queryKey: KEYS.list,
    queryFn: () => notificationsService.list(),
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => notificationsService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError>({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
