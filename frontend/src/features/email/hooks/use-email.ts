"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { emailService } from "../services/email-service";
import type { EmailBroadcastMessage, SendEmailPayload } from "../types";

const KEYS = {
  threads: (archived: boolean, search: string) =>
    ["email", "threads", archived, search] as const,
  root: ["email", "threads"] as const,
  messages: (id: string) => ["email", "messages", id] as const,
  hidden: ["email", "admin", "hidden"] as const,
  audit: ["email", "admin", "audit"] as const,
};

/**
 * Inbox threads. Polled as a fallback; the broadcast below delivers instantly
 * once a sync run lands new mail.
 */
export function useEmailThreads(archived = false, search = "") {
  return useQuery({
    queryKey: KEYS.threads(archived, search),
    queryFn: () => emailService.threads({ archived, search }),
    refetchInterval: 30_000,
  });
}

export function useEmailMessages(threadId: string | null) {
  return useQuery({
    queryKey: KEYS.messages(threadId ?? "none"),
    queryFn: () => emailService.messages(threadId as string),
    enabled: Boolean(threadId),
  });
}

/**
 * Subscribe to the shared inbox channel.
 *
 * One channel for the whole team: a rep needs the thread list to reorder the
 * moment mail arrives, even for threads they have not opened. No-op when
 * Reverb isn't configured — polling still covers it.
 */
export function useEmailRealtime(openThreadId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    echo
      .private("email.inbox")
      .listen(".email.message", (e: EmailBroadcastMessage) => {
        // Refetch the open thread rather than synthesising a message: email
        // bodies are large and arrive parsed, so a refetch is both simpler
        // and cheaper than mirroring the whole shape client-side.
        if (e.threadId && e.threadId === openThreadId) {
          void qc.invalidateQueries({ queryKey: KEYS.messages(e.threadId) });
        }
        void qc.invalidateQueries({ queryKey: KEYS.root });
      });

    return () => {
      echo.leave("email.inbox");
    };
  }, [openThreadId, qc]);
}

export function useSendEmail(threadId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendEmailPayload) =>
      emailService.send(threadId as string, payload),
    onSuccess: () => {
      if (threadId) {
        void qc.invalidateQueries({ queryKey: KEYS.messages(threadId) });
      }
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

export function useAssignEmailThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      userId,
    }: {
      threadId: string;
      userId: string | null;
    }) => emailService.assign(threadId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

export function useArchiveEmailThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      archived,
    }: {
      threadId: string;
      archived: boolean;
    }) => emailService.archive(threadId, archived),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.root });
    },
  });
}

/** Hide a message from the inbox — soft only; admins still see it. */
export function useHideEmailMessage(threadId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => emailService.hideMessage(messageId),
    onSuccess: () => {
      if (threadId) {
        void qc.invalidateQueries({ queryKey: KEYS.messages(threadId) });
      }
      void qc.invalidateQueries({ queryKey: KEYS.hidden });
    },
  });
}

// ---- Admin ----

export function useEmailHiddenMessages(enabled = true) {
  return useQuery({
    queryKey: KEYS.hidden,
    queryFn: () => emailService.hiddenMessages(),
    enabled,
  });
}

export function useEmailAuditLog(enabled = true) {
  return useQuery({
    queryKey: KEYS.audit,
    queryFn: () => emailService.auditLog(),
    enabled,
  });
}

export function useRestoreEmailMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => emailService.restoreMessage(messageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.hidden });
      void qc.invalidateQueries({ queryKey: ["email", "messages"] });
    },
  });
}
