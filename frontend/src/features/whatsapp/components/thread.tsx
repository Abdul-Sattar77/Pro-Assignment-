"use client";

import { useEffect, useRef } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Archive, Clock, Loader2, Phone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/http-error";
import {
  useArchiveWhatsAppThread,
  useHideWhatsAppMessage,
  useSendWhatsAppMessage,
  useSendWhatsAppTemplate,
  useWhatsAppMessages,
} from "../hooks/use-whatsapp";
import type { SendWhatsAppPayload, WhatsAppConversation } from "../types";
import { WhatsAppComposer } from "./composer";
import { WhatsAppMessageBubble } from "./message-bubble";

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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{conversation.name}</p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Phone className="size-3" />
            {conversation.phone ?? `+${conversation.waId}`}
            {conversation.portalUser && (
              <span className="text-emerald-600 dark:text-emerald-400">
                · {conversation.portalUser.name} (portal user)
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <UserCheck className="size-3" />
            {conversation.assignedTo?.name ?? "Unassigned"}
          </span>

          {conversation.withinServiceWindow &&
            conversation.serviceWindowExpiresAt && (
              <span
                className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300"
                title="Free-form replies are free of charge until this expires"
              >
                <Clock className="size-3" />
                Free window:{" "}
                {formatDistanceToNowStrict(
                  new Date(conversation.serviceWindowExpiresAt),
                )}{" "}
                left
              </span>
            )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              archive.mutate({
                conversationId: conversation.id,
                archived: !conversation.isArchived,
              })
            }
          >
            <Archive className="size-3.5" />
            {conversation.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {isPending ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No messages in this thread yet.
          </p>
        ) : (
          messages.map((m) => (
            <WhatsAppMessageBubble
              key={m.id}
              message={m}
              canHide={canHide}
              onHide={(id) => hide.mutate(id)}
            />
          ))
        )}
        <div ref={bottom} />
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
