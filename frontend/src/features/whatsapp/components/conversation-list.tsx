"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Archive, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsAppConversation } from "../types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Short preview text for a thread's last message. */
function preview(conversation: WhatsAppConversation): string {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";

  const label: Partial<Record<string, string>> = {
    image: "📷 Photo",
    document: "📄 Document",
    audio: "🎤 Voice message",
    video: "🎬 Video",
    sticker: "🌟 Sticker",
    location: "📍 Location",
    contacts: "👤 Contact",
  };

  const text = last.body?.trim() || label[last.type] || "Message";
  return last.outbound ? `You: ${text}` : text;
}

export function WhatsAppConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: WhatsAppConversation[];
  selectedId: string | null;
  onSelect: (conversation: WhatsAppConversation) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        <MessageCircle className="mx-auto mb-2 size-8 opacity-40" />
        No conversations yet.
        <p className="mt-1 text-xs">
          Threads appear here the moment a customer messages your WhatsApp
          Business number.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-border/50 divide-y">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c)}
            className={cn(
              "hover:bg-muted/50 flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
              selectedId === c.id && "bg-muted",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {initials(c.name)}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{c.name}</span>
                {c.lastMessageAt && (
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {formatDistanceToNowStrict(new Date(c.lastMessageAt), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </span>

              <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-xs">{preview(c)}</span>
              </span>

              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {c.unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {c.unreadCount}
                  </span>
                )}

                {/* Assignment is the audit anchor — always show who owns it. */}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    c.assignedTo
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-300"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {c.assignedTo?.name ?? "Unassigned"}
                </span>

                {/* Closed window = replies now cost money. Flag it in the list. */}
                {!c.withinServiceWindow && (
                  <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                    <Clock className="size-2.5" />
                    Window closed
                  </span>
                )}

                {c.isArchived && (
                  <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                    <Archive className="size-2.5" />
                    Archived
                  </span>
                )}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
