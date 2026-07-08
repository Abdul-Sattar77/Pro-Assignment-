"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http-error";
import { messagesService } from "../services/messages-service";
import type { Message } from "../types";

const messagesKey = (assignmentId: string) =>
  ["assignments", "messages", assignmentId] as const;

/**
 * Order chat. Polls every 8s so new messages appear without a refresh —
 * realtime-ready: swap the interval for a Reverb socket event later and the
 * component doesn't change.
 */
export function useMessages(assignmentId: string) {
  return useQuery<Message[], ApiError>({
    queryKey: messagesKey(assignmentId),
    queryFn: () => messagesService.list(assignmentId),
    refetchInterval: 8000,
  });
}

export function useSendMessage(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<Message, ApiError, string>({
    mutationFn: (body) => messagesService.send(assignmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: messagesKey(assignmentId),
      });
    },
  });
}
