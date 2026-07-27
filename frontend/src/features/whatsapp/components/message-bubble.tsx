"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Download,
  EyeOff,
  Paperclip,
  Pencil,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "../types";

/** Delivery ticks, mirroring WhatsApp's own vocabulary. */
function StatusTicks({ message }: { message: WhatsAppMessage }) {
  if (!message.outbound) return null;

  switch (message.status) {
    case "pending":
      return <Clock className="size-3 opacity-60" />;
    case "sent":
      return <Check className="size-3 opacity-60" />;
    case "delivered":
      return <CheckCheck className="size-3 opacity-60" />;
    case "read":
      return <CheckCheck className="size-3 text-sky-500" />;
    case "failed":
      return <AlertCircle className="size-3 text-red-500" />;
  }
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function WhatsAppMessageBubble({
  message,
  canHide,
  onHide,
}: {
  message: WhatsAppMessage;
  canHide: boolean;
  onHide: (id: string) => void;
}) {
  const outbound = message.outbound;

  return (
    <div
      className={cn(
        "flex w-full",
        outbound ? "justify-end" : "justify-start",
        // Hidden messages are only ever sent to admins; make them visually
        // unmistakable so oversight reads at a glance.
        message.deleted && "opacity-70",
      )}
    >
      <div
        className={cn(
          "group relative max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          outbound
            ? "rounded-br-sm bg-emerald-600 text-white"
            : "bg-muted rounded-bl-sm",
          message.deleted && "ring-2 ring-red-500/40",
        )}
      >
        {/* Attribution: which sales rep sent this. The client's core ask. */}
        {outbound && message.sender?.name && (
          <p className="mb-0.5 text-[11px] font-semibold text-emerald-100">
            {message.sender.name}
          </p>
        )}

        {/* Sent from the phone app — no rep attribution is possible, so say
            so plainly rather than leaving an unexplained blank. */}
        {outbound && message.viaBusinessApp && (
          <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-100/90">
            <Smartphone className="size-3" />
            Sent from phone app
          </p>
        )}

        {message.isTemplate && (
          <p
            className={cn(
              "mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium",
              outbound ? "bg-emerald-700/60" : "bg-background",
            )}
          >
            Paid template{message.templateName && `: ${message.templateName}`}
          </p>
        )}

        {message.attachment && (
          <a
            href={message.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mb-1.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
              outbound
                ? "bg-emerald-700/50 hover:bg-emerald-700/70"
                : "bg-background/70 hover:bg-background",
            )}
          >
            <Paperclip className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              {message.attachment.name ?? "Attachment"}
            </span>
            <span className="shrink-0 opacity-70">
              {formatBytes(message.attachment.size)}
            </span>
            <Download className="size-3.5 shrink-0" />
          </a>
        )}

        {message.body && (
          <p className="wrap-break-word whitespace-pre-wrap">{message.body}</p>
        )}

        {message.editedAt && (
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[10px]",
              outbound ? "text-emerald-100/70" : "text-muted-foreground",
            )}
          >
            <Pencil className="size-2.5" />
            edited
          </p>
        )}

        {message.status === "failed" && message.errorMessage && (
          <p className="mt-1 text-[11px] text-red-200">
            Not delivered: {message.errorMessage}
          </p>
        )}

        {message.deleted && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
            <EyeOff className="size-3" />
            Hidden by {message.deletedBy?.name ?? "a user"}
            {message.deletedAt &&
              ` · ${format(new Date(message.deletedAt), "d MMM HH:mm")}`}
          </p>
        )}

        <div
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
            outbound ? "text-emerald-100/80" : "text-muted-foreground",
          )}
        >
          {message.createdAt && (
            <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          )}
          <StatusTicks message={message} />
        </div>

        {canHide && !message.deleted && (
          <button
            type="button"
            onClick={() => onHide(message.id)}
            title="Hide from inbox (stays in the database and admin audit log)"
            className={cn(
              "bg-background text-muted-foreground hover:text-foreground absolute -top-2 rounded-full border p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
              outbound ? "-left-2" : "-right-2",
            )}
          >
            <EyeOff className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
