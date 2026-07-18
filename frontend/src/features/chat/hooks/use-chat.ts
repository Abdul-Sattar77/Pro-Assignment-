"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { chatService } from "../services/chat-service";
import type { ChatMessage, SendMessagePayload } from "../types";

/** Shape of the broadcast payload from ChatMessageSent. */
interface BroadcastMessage {
  id: string;
  type: ChatMessage["type"];
  body: string | null;
  senderId: string | null;
  senderName: string | null;
  attachment: ChatMessage["attachment"];
  createdAt: string | null;
}

const KEYS = {
  contacts: ["chat", "contacts"] as const,
  conversations: ["chat", "conversations"] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
  policies: ["chat", "policies"] as const,
  adminConversations: ["chat", "admin", "conversations"] as const,
  adminMessages: (id: string) => ["chat", "admin", "messages", id] as const,
};

/** Contacts the current user may message. */
export function useChatContacts() {
  return useQuery({
    queryKey: KEYS.contacts,
    queryFn: () => chatService.contacts(),
    staleTime: 60_000,
  });
}

/** The current user's conversations. Polled for unread/last-message updates. */
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: KEYS.conversations,
    queryFn: () => chatService.conversations(),
    refetchInterval: enabled ? 8_000 : false,
    enabled,
  });
}

/** Messages for the open conversation. Polled while open. */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: KEYS.messages(conversationId ?? "none"),
    queryFn: () => chatService.messages(conversationId as string),
    enabled: Boolean(conversationId),
    // Slow poll as a fallback; realtime (below) delivers instantly when up.
    refetchInterval: conversationId ? 12_000 : false,
  });
}

/**
 * Subscribe to the conversation's private channel for instant delivery. New
 * messages (from others — the sender appends optimistically) are merged into
 * the cache. No-op when Reverb isn't configured; polling still covers it.
 */
export function useConversationRealtime(conversationId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = `chat.conversation.${conversationId}`;
    echo.private(channelName).listen(".message.sent", (e: BroadcastMessage) => {
      const message: ChatMessage = {
        id: e.id,
        type: e.type,
        body: e.body,
        mine: false,
        sender: { id: e.senderId, name: e.senderName },
        attachment: e.attachment,
        createdAt: e.createdAt,
      };
      qc.setQueryData<ChatMessage[]>(KEYS.messages(conversationId), (prev) => {
        if (!prev) return [message];
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      void qc.invalidateQueries({ queryKey: KEYS.conversations });
    });

    return () => {
      echo.leave(channelName);
    };
  }, [conversationId, qc]);
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => chatService.start(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.conversations });
    },
  });
}

export function useSendMessage(conversationId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      chatService.send(conversationId as string, payload),
    onSuccess: (message: ChatMessage) => {
      if (!conversationId) return;
      qc.setQueryData<ChatMessage[]>(KEYS.messages(conversationId), (prev) =>
        prev ? [...prev, message] : [message],
      );
      void qc.invalidateQueries({ queryKey: KEYS.conversations });
    },
  });
}

// ---- Admin ----
export function useChatPolicies(enabled = true) {
  return useQuery({
    queryKey: KEYS.policies,
    queryFn: () => chatService.policies(),
    enabled,
  });
}

export function useUpdateChatPolicies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      policies: { role_a: string; role_b: string; allowed: boolean }[],
    ) => chatService.updatePolicies(policies),
    onSuccess: (data) => qc.setQueryData(KEYS.policies, data),
  });
}

export function useAdminConversations(enabled = true) {
  return useQuery({
    queryKey: KEYS.adminConversations,
    queryFn: () => chatService.adminConversations(),
    enabled,
    refetchInterval: enabled ? 10_000 : false,
  });
}

export function useAdminMessages(conversationId: string | null) {
  return useQuery({
    queryKey: KEYS.adminMessages(conversationId ?? "none"),
    queryFn: () => chatService.adminMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 5_000 : false,
  });
}
