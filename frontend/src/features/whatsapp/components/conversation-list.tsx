"use client";

import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { Archive, Check, CheckCheck, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WA } from "../theme";
import type { WhatsAppConversation } from "../types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** WhatsApp's timestamp rule: time today, "Yesterday", then a date. */
function listTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, isThisYear(d) ? "dd/MM/yyyy" : "dd/MM/yyyy");
}

const TYPE_PREVIEW: Partial<Record<string, string>> = {
  image: "📷 Photo",
  document: "📄 Document",
  audio: "🎤 Voice message",
  video: "🎬 Video",
  sticker: "🌟 Sticker",
  location: "📍 Location",
  contacts: "👤 Contact",
};

/** Ticks shown beside your own last message in the list, as WhatsApp does. */
function PreviewTicks({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Clock className="size-3.5 shrink-0 opacity-60" />;
    case "sent":
      return <Check className="size-3.5 shrink-0 opacity-60" />;
    case "delivered":
      return <CheckCheck className="size-3.5 shrink-0 opacity-60" />;
    case "read":
      return <CheckCheck className={cn("size-3.5 shrink-0", WA.tickRead)} />;
    default:
      return null;
  }
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
      <div className={cn("px-6 py-14 text-center", WA.muted)}>
        <MessageCircle className="mx-auto mb-3 size-10 opacity-30" />
        <p className="text-sm">No chats yet</p>
        <p className="mt-1 text-xs">
          Conversations appear the moment a customer messages your WhatsApp
          Business number.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {conversations.map((c) => {
        const last = c.lastMessage;
        const preview =
          last?.body?.trim() || (last ? (TYPE_PREVIEW[last.type] ?? "") : "");
        const unread = c.unreadCount > 0;

        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className={cn(
                "flex w-full items-center gap-3 pl-3 text-left transition-colors",
                WA.rowHover,
                selectedId === c.id && WA.rowActive,
              )}
            >
              {/* Avatar sits outside the divider, as in WhatsApp. */}
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-sm font-medium text-[#5c6b73] dark:bg-[#2a3942] dark:text-[#aebac1]">
                {initials(c.name)}
              </span>

              <span
                className={cn(
                  "flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-b py-3 pr-3",
                  WA.border,
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-[15px] leading-tight",
                      WA.text,
                    )}
                  >
                    {c.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] leading-tight",
                      unread ? WA.accentText : WA.muted,
                    )}
                  >
                    {listTime(c.lastMessageAt)}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex min-w-0 items-center gap-1 text-[13px]",
                      WA.muted,
                    )}
                  >
                    {last?.outbound && <PreviewTicks status={last.status} />}
                    <span className="truncate">{preview}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5">
                    {/* Ownership + window state are portal concerns WhatsApp
                        has no equivalent for; kept small so the row still
                        reads as a chat list. */}
                    {!c.withinServiceWindow && (
                      <Clock
                        className={cn("size-3", WA.muted)}
                        aria-label="24-hour reply window closed"
                      />
                    )}
                    {c.isArchived && (
                      <Archive className={cn("size-3", WA.muted)} />
                    )}
                    {unread && (
                      <span className="flex min-w-5 items-center justify-center rounded-full bg-[#25d366] px-1.5 py-0.5 text-[11px] leading-none font-medium text-[#111b21]">
                        {c.unreadCount}
                      </span>
                    )}
                  </span>
                </span>

                {/* Who owns the thread — the audit anchor, kept subtle. */}
                <span className={cn("truncate text-[11px]", WA.muted)}>
                  {c.assignedTo ? `● ${c.assignedTo.name}` : "○ Unassigned"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
