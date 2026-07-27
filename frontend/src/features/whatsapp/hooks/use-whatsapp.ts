"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { whatsappService } from "../services/whatsapp-service";
import type {
  SendWhatsAppPayload,
  WhatsAppBroadcastMessage,
  WhatsAppBroadcastStatus,
  WhatsAppConversation,
  WhatsAppMessage,
} from "../types";

const KEYS = {
  conversations: (archived: boolean, search: string) =>
    ["whatsapp", "conversations", archived, search] as const,
  root: ["whatsapp", "conversations"] as const,
  messages: (id: string) => ["whatsapp", "messages", id] as const,
  hidden: ["whatsapp", "admin", "hidden"] as const,
  audit: ["whatsapp", "admin", "audit"] as const,
};

/** Inbox threads. Polled as a fallback; realtime delivers instantly. */
export function useWhatsAppConversations(archived = false, search = "") {
  return useQuery({
    queryKey: KEYS.conversations(archived, search),
    queryFn: () => whatsappService.conversations({ archived, search }),
    refetchInterval: 15_000,
  });
}

/** Messages for the open thread. */
export function useWhatsAppMessages(conversationId: string | null) {
  return useQuery({
    queryKey: KEYS.messages(conversationId ?? "none"),
    queryFn: () => whatsappService.messages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 20_000 : false,
  });
}

export function useWhatsAppConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ["whatsapp", "conversation", conversationId] as const,
    queryFn: () => whatsappService.conversation(conversationId as string),
    enabled: Boolean(conversationId),
  });
}

/**
 * Subscribe to the shared inbox channel.
 *
 * One channel for the whole team (not per-thread): a rep needs the
 * conversation list to reorder the moment a customer writes in, even for
 * threads they have not opened. No-op when Reverb isn't configured — the
 * polling above still covers it.
 */
export function useWhatsAppRealtime(openConversationId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private("whatsapp.inbox");

    channel.listen(".whatsapp.message", (e: WhatsAppBroadcastMessage) => {
      // Only merge into the thread the user is actually looking at; other
      // threads just need the list refreshed.
      if (e.conversationId && e.conversationId === openConversationId) {
        qc.setQueryData<WhatsAppMessage[]>(
          KEYS.messages(e.conversationId),
          (prev) => {
            if (!prev) return prev;
            if (prev.some((m) => m.id === e.id)) return prev;
            const incoming: WhatsAppMessage = {
              id: e.id,
              direction: e.direction,
              type: e.type,
              body: e.body,
              outbound: e.direction === "outbound",
              mine: false,
              sender: e.sender,
              status: e.status,
              statusLabel: e.status,
              errorMessage: null,
              isTemplate: false,
              templateName: null,
              viaBusinessApp: false,
              editedAt: null,
              attachment: null,
              deleted: false,
              deletedBy: null,
              deletedAt: null,
              createdAt: e.createdAt,
              sentAt: e.createdAt,
            };
            return [...prev, incoming];
          },
        );
      }
      void qc.invalidateQueries({ queryKey: KEYS.root });
    });

    channel.listen(".whatsapp.status", (e: WhatsAppBroadcastStatus) => {
      if (!e.conversationId) return;
      qc.setQueryData<WhatsAppMessage[]>(
        KEYS.messages(e.conversationId),
        (prev) =>
          prev?.map((m) =>
            m.id === e.id
              ? { ...m, status: e.status, errorMessage: e.errorMessage }
              : m,
          ),
      );
    });

    return () => {
      echo.leave("whatsapp.inbox");
    };
  }, [openConversationId, qc]);
}

export function useSendWhatsAppMessage(conversationId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendWhatsAppPayload) =>
      whatsappService.send(conversationId as string, payload),
    onSuccess: (message) => {
      if (!conversationId) return;
      qc.setQueryData<WhatsAppMessage[]>(
        KEYS.messages(conversationId),
        (prev) => (prev ? [...prev, message] : [message]),
      );
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

export function useSendWhatsAppTemplate(conversationId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (parameters: string[]) =>
      whatsappService.sendTemplate(conversationId as string, parameters),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
      if (conversationId) {
        void qc.invalidateQueries({ queryKey: KEYS.messages(conversationId) });
      }
    },
  });
}

export function useAssignWhatsAppThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string | null;
    }) => whatsappService.assign(conversationId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

export function useArchiveWhatsAppThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      archived,
    }: {
      conversationId: string;
      archived: boolean;
    }) => whatsappService.archive(conversationId, archived),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

/** Hide a message from the inbox — soft only; admins still see it. */
export function useHideWhatsAppMessage(conversationId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => whatsappService.hideMessage(messageId),
    onSuccess: () => {
      if (conversationId) {
        void qc.invalidateQueries({ queryKey: KEYS.messages(conversationId) });
      }
      void qc.invalidateQueries({ queryKey: KEYS.hidden });
    },
  });
}

export function useMarkWhatsAppRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      whatsappService.markRead(conversationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

// ---- Admin ----

export function useWhatsAppHiddenMessages(enabled = true) {
  return useQuery({
    queryKey: KEYS.hidden,
    queryFn: () => whatsappService.hiddenMessages(),
    enabled,
  });
}

export function useWhatsAppAuditLog(enabled = true) {
  return useQuery({
    queryKey: KEYS.audit,
    queryFn: () => whatsappService.auditLog(),
    enabled,
  });
}

export function useRestoreWhatsAppMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      whatsappService.restoreMessage(messageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.hidden });
      void qc.invalidateQueries({ queryKey: ["whatsapp", "messages"] });
    },
  });
}

export type { WhatsAppConversation };
