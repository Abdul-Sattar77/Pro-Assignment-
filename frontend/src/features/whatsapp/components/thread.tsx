"use client";

import { Fragment, useEffect, useRef } from "react";
import {
  format,
  formatDistanceToNowStrict,
  isThisYear,
  isToday,
  isYesterday,
} from "date-fns";
import { Archive, Clock, Loader2, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/http-error";
import {
  useArchiveWhatsAppThread,
  useHideWhatsAppMessage,
  useSendWhatsAppMessage,
  useSendWhatsAppTemplate,
  useWhatsAppMessages,
} from "../hooks/use-whatsapp";
import { WA, doodleStyle } from "../theme";
import type {
  SendWhatsAppPayload,
  WhatsAppConversation,
  WhatsAppMessage,
} from "../types";
import { WhatsAppComposer } from "./composer";
import { WhatsAppMessageBubble } from "./message-bubble";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** WhatsApp's day separator wording. */
function dayLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return "TODAY";
  if (isYesterday(d)) return "YESTERDAY";
  return format(d, isThisYear(d) ? "d MMMM" : "d MMMM yyyy").toUpperCase();
}

function dayKey(iso: string | null): string {
  return iso ? new Date(iso).toDateString() : "unknown";
}

/** A centred pill floating over the wallpaper. */
function ChatPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center py-2">
      <span
        className={cn(
          "rounded-lg px-3 py-1 text-[11.5px] font-medium shadow-sm",
          WA.pill,
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function WhatsAppThread({
  conversation,
  canHide,
  onError,
}: {
  conversation: WhatsAppConversation;
  canHide: boolean;
  onError: (message: string) => void;
}) {
  const { data: messages = [], isPending } = useWhatsAppMessages(
    conversation.id,
  );
  const send = useSendWhatsAppMessage(conversation.id);
  const sendTemplate = useSendWhatsAppTemplate(conversation.id);
  const hide = useHideWhatsAppMessage(conversation.id);
  const archive = useArchiveWhatsAppThread();

  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (payload: SendWhatsAppPayload) => {
    send.mutate(payload, {
      onError: (error) => {
        // A closed window comes back as `template_required`; surface Meta's
        // actual reason rather than a generic failure.
        onError(
          error instanceof ApiError
            ? error.message
            : "Could not send the message. Please try again.",
        );
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ---- Header ---- */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b px-4 py-2",
          WA.header,
          WA.border,
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-[13px] font-medium text-[#5c6b73] dark:bg-[#2a3942] dark:text-[#aebac1]">
          {initials(conversation.name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[16px] leading-tight", WA.text)}>
            {conversation.name}
          </p>
          <p className={cn("truncate text-[12.5px] leading-tight", WA.muted)}>
            {conversation.phone ?? `+${conversation.waId}`}
            {conversation.portalUser && ` · ${conversation.portalUser.name}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("flex items-center gap-1 text-[12px]", WA.muted)}>
            <UserCheck className="size-3.5" />
            {conversation.assignedTo?.name ?? "Unassigned"}
          </span>

          {conversation.withinServiceWindow &&
            conversation.serviceWindowExpiresAt && (
              <span
                className="flex items-center gap-1 rounded-full bg-[#00a884]/15 px-2 py-0.5 text-[11.5px] text-[#00a884]"
                title="Free-form replies are free of charge until this expires"
              >
                <Clock className="size-3" />
                {formatDistanceToNowStrict(
                  new Date(conversation.serviceWindowExpiresAt),
                )}{" "}
                left
              </span>
            )}

          <Button
            size="sm"
            variant="ghost"
            className={WA.muted}
            onClick={() =>
              archive.mutate({
                conversationId: conversation.id,
                archived: !conversation.isArchived,
              })
            }
          >
            <Archive className="size-4" />
            {conversation.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      {/* ---- Messages over the doodle wallpaper ---- */}
      <div className={cn("relative min-h-0 flex-1 overflow-y-auto", WA.chat)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.04] dark:invert"
          style={doodleStyle}
        />

        <div className="relative px-6 py-3 md:px-12 lg:px-20">
          {isPending ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className={cn("size-5 animate-spin", WA.muted)} />
            </div>
          ) : messages.length === 0 ? (
            <ChatPill>No messages yet</ChatPill>
          ) : (
            <>
              <ChatPill>
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3" />
                  Messages are stored in the portal and visible to admins
                </span>
              </ChatPill>

              {messages.map((m: WhatsAppMessage, i: number) => {
                const prev = i > 0 ? messages[i - 1] : null;
                const newDay =
                  dayKey(m.createdAt) !== dayKey(prev?.createdAt ?? null);
                // Only the first bubble of a same-side run gets a tail.
                const startsRun =
                  newDay || prev === null || prev.outbound !== m.outbound;

                return (
                  <Fragment key={m.id}>
                    {newDay && <ChatPill>{dayLabel(m.createdAt)}</ChatPill>}
                    <WhatsAppMessageBubble
                      message={m}
                      canHide={canHide}
                      onHide={(id) => hide.mutate(id)}
                      startsRun={startsRun}
                    />
                  </Fragment>
                );
              })}
            </>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <WhatsAppComposer
        conversation={conversation}
        sending={send.isPending}
        sendingTemplate={sendTemplate.isPending}
        onSend={handleSend}
        onSendTemplate={() =>
          sendTemplate.mutate([], {
            onError: (error) =>
              onError(
                error instanceof ApiError
                  ? error.message
                  : "Could not send the template.",
              ),
          })
        }
      />
    </div>
  );
}
