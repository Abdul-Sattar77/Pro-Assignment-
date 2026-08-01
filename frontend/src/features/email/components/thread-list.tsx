"use client";

import { format, isThisYear, isToday } from "date-fns";
import { Archive, Inbox, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadAuthed } from "@/lib/download";
import { GM, avatarTint } from "../theme";
import type { EmailThread } from "../types";

function initial(value: string): string {
  return (value.trim()[0] ?? "?").toUpperCase();
}

/** Gmail's date rule: time today, "12 Mar" this year, else "12/03/2024". */
function listDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  return format(d, isThisYear(d) ? "d MMM" : "dd/MM/yyyy");
}

export function EmailThreadList({
  threads,
  selectedId,
  onSelect,
}: {
  threads: EmailThread[];
  selectedId: string | null;
  onSelect: (thread: EmailThread) => void;
}) {
  if (threads.length === 0) {
    return (
      <div className={cn("px-6 py-16 text-center", GM.muted)}>
        <Inbox className="mx-auto mb-3 size-10 opacity-30" />
        <p className="text-sm">Nothing here</p>
        <p className="mt-1 text-xs">
          Threads appear once the mailbox sync pulls in new mail.
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y", GM.border)}>
      {threads.map((t) => {
        const unread = t.unreadCount > 0;
        const name = t.contact.name ?? t.contact.email ?? "Unknown";

        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-shadow",
                selectedId === t.id
                  ? GM.rowActive
                  : unread
                    ? GM.rowUnread
                    : GM.rowRead,
                selectedId !== t.id && GM.rowHover,
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white",
                  avatarTint(t.contact.email ?? name),
                )}
              >
                {initial(name)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-[13.5px]",
                      GM.text,
                      unread && "font-bold",
                    )}
                  >
                    {name}
                    {t.messageCount > 1 && (
                      <span className={cn("ml-1.5 text-[12px]", GM.muted)}>
                        {t.messageCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[11.5px]",
                      unread ? cn("font-bold", GM.text) : GM.muted,
                    )}
                  >
                    {listDate(t.lastMessageAt)}
                  </span>
                </span>

                <span
                  className={cn(
                    "block truncate text-[13px]",
                    GM.text,
                    unread && "font-bold",
                  )}
                >
                  {t.subject}
                </span>

                <span className={cn("block truncate text-[12.5px]", GM.muted)}>
                  {t.lastMessage?.outbound && "You: "}
                  {t.lastMessage?.snippet}
                </span>

                <span className="mt-1 flex items-center gap-1.5">
                  {/* Ownership is the audit anchor — Gmail has no equivalent,
                      so it is shown as a small chip rather than a column. */}
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10.5px] leading-none",
                      GM.chip,
                    )}
                  >
                    {t.assignedTo?.name ?? "Unassigned"}
                  </span>
                  {t.isArchived && (
                    <Archive className={cn("size-3", GM.muted)} />
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Small helper reused by the reading pane for attachment rows. */
export function AttachmentChip({
  name,
  size,
  url,
  stored,
}: {
  name: string | null;
  size: number | null;
  url: string;
  stored: boolean;
}) {
  const label = size ? `${Math.max(1, Math.round(size / 1024))} KB` : "";

  if (!stored) {
    return (
      <span
        className={cn(
          "flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs",
          GM.border,
          GM.muted,
        )}
        title="Too large to mirror locally — still in the mailbox"
      >
        <Paperclip className="size-3.5" />
        {name} <span className="opacity-70">(not stored)</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => downloadAuthed(url, name ?? "attachment")}
      className={cn(
        "flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5",
        GM.border,
        GM.text,
      )}
    >
      <Paperclip className="size-3.5 shrink-0" />
      <span className="max-w-52 truncate">{name}</span>
      <span className={GM.muted}>{label}</span>
    </button>
  );
}
