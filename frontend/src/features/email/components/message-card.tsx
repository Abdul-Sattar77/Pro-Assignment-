"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  Clock,
  EyeOff,
  Mail,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GM, avatarTint } from "../theme";
import type { EmailMessage } from "../types";
import { AttachmentChip } from "./thread-list";

/**
 * Renders an email body.
 *
 * HTML mail is rendered inside a **sandboxed iframe with no permissions** —
 * `sandbox=""` blocks scripts, forms, popups and same-origin access outright.
 * The backend also strips scripts/handlers before storage, but this is the
 * control that actually contains hostile markup: email HTML is far too varied
 * to sanitise reliably by pattern alone.
 */
function Body({ message }: { message: EmailMessage }) {
  if (message.bodyHtml) {
    return (
      <iframe
        sandbox=""
        title="Email content"
        srcDoc={`<!doctype html><meta name="color-scheme" content="light dark"><base target="_blank"><style>body{margin:0;font:14px/1.5 system-ui,sans-serif;color:#202124}img{max-width:100%;height:auto}</style>${message.bodyHtml}`}
        className="h-96 w-full rounded border-0 bg-white"
      />
    );
  }

  return (
    <p
      className={cn("text-[14px] leading-relaxed whitespace-pre-wrap", GM.text)}
    >
      {message.bodyText ?? <span className={GM.muted}>(no content)</span>}
    </p>
  );
}

function StatusIcon({ status }: { status: EmailMessage["status"] }) {
  switch (status) {
    case "queued":
      return <Clock className="size-3.5" />;
    case "sent":
      return <Send className="size-3.5" />;
    case "failed":
      return <AlertCircle className="size-3.5 text-red-500" />;
    default:
      return <Mail className="size-3.5" />;
  }
}

export function EmailMessageCard({
  message,
  defaultOpen,
  canHide,
  onHide,
}: {
  message: EmailMessage;
  defaultOpen: boolean;
  canHide: boolean;
  onHide: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const displayName =
    message.from.name ?? message.from.email ?? "Unknown sender";
  const recipients = message.to
    .map((t) => t.name ?? t.email)
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={cn(
        "rounded-lg border",
        GM.raised,
        GM.border,
        message.deleted && "ring-1 ring-red-500/50",
      )}
    >
      <header
        className="flex cursor-pointer items-start gap-3 px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white",
            avatarTint(message.from.email ?? displayName),
          )}
        >
          {(displayName.trim()[0] ?? "?").toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={cn("text-[13.5px] font-medium", GM.text)}>
              {displayName}
            </span>
            <span className={cn("text-[12px]", GM.muted)}>
              {message.from.email}
            </span>
          </div>

          <p className={cn("truncate text-[12px]", GM.muted)}>
            to {recipients || "—"}
          </p>

          {/* Attribution — the client's core audit requirement. */}
          {message.outbound && message.sender?.name && (
            <p className={cn("text-[12px]", GM.accentText)}>
              Sent by {message.sender.name} from the portal
            </p>
          )}
          {message.outbound && message.viaMailClient && (
            <p className={cn("text-[12px]", GM.muted)}>
              Sent directly from Gmail — no portal user recorded
            </p>
          )}

          {!open && (
            <p className={cn("mt-1 truncate text-[13px]", GM.muted)}>
              {message.snippet}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2 text-[11.5px]",
            GM.muted,
          )}
        >
          <StatusIcon status={message.status} />
          {message.sentAt && (
            <span>{format(new Date(message.sentAt), "d MMM HH:mm")}</span>
          )}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </div>
      </header>

      {open && (
        <div className={cn("border-t px-4 py-3", GM.border)}>
          {message.status === "failed" && message.errorMessage && (
            <p className="mb-2 rounded bg-red-500/10 px-3 py-2 text-[12.5px] text-red-500">
              Not delivered — {message.errorMessage}
            </p>
          )}

          {message.deleted && (
            <p className="mb-2 flex items-center gap-1.5 rounded bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-500">
              <EyeOff className="size-3.5" />
              Hidden from the inbox by {message.deletedBy?.name ?? "a user"}
              {message.deletedAt &&
                ` on ${format(new Date(message.deletedAt), "d MMM yyyy HH:mm")}`}
              . Still stored and visible to admins.
            </p>
          )}

          <Body message={message} />

          {message.attachments.length > 0 && (
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-2 border-t pt-3",
                GM.border,
              )}
            >
              {message.attachments.map((a) => (
                <AttachmentChip key={a.id} {...a} />
              ))}
            </div>
          )}

          {canHide && !message.deleted && (
            <button
              type="button"
              onClick={() => onHide(message.id)}
              title="Hide from inbox (stays in the database and admin audit log)"
              className={cn(
                "mt-3 flex items-center gap-1.5 text-[12px] hover:underline",
                GM.muted,
              )}
            >
              <EyeOff className="size-3.5" />
              Hide from inbox
            </button>
          )}
        </div>
      )}
    </article>
  );
}
