"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { MESSAGING_QUERY_KEYS } from "../constants";
import { messageService } from "../services/message-service";
import type { Conversation, Message, SendMessagePayload } from "../types";

export function useConversations(search?: string, type?: string) {
  return useQuery<Conversation[], ApiError>({
    queryKey: MESSAGING_QUERY_KEYS.conversations(search, type),
    queryFn: () => messageService.listConversations(search, type),
    refetchInterval: 10 * 1000, // Poll list every 10 seconds
  });
}

export function useChatHistory(conversationId: string | null) {
  return useQuery<Message[], ApiError>({
    queryKey: MESSAGING_QUERY_KEYS.history(conversationId || ""),
    queryFn: () => messageService.listMessages(conversationId || ""),
    enabled: conversationId !== null && conversationId !== "",
    refetchInterval: 3000, // Poll message history every 3 seconds for active chats!
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, ApiError, SendMessagePayload>({
    mutationFn: (payload) => messageService.sendMessage(payload),
    onSuccess: (msg) => {
      void queryClient.invalidateQueries({
        queryKey: MESSAGING_QUERY_KEYS.all,
      });
    },
    onError: (error) => toast.error(error.message || "Failed to send message."),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => messageService.deleteMessage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MESSAGING_QUERY_KEYS.all,
      });
      toast.success("Message deleted.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete message."),
  });
}

export function useUnreadCount() {
  return useQuery<number, ApiError>({
    queryKey: MESSAGING_QUERY_KEYS.unreadCount(),
    queryFn: () => messageService.getUnreadCount(),
    refetchInterval: 15 * 1000, // Poll unread counts badge every 15 seconds
  });
}
