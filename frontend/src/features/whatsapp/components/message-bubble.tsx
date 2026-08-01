"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Download,
  EyeOff,
  FileText,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadAuthed } from "@/lib/download";
import { WA } from "../theme";
import type { WhatsAppMessage } from "../types";

/** Delivery ticks, mirroring WhatsApp's own vocabulary. */
function StatusTicks({ message }: { message: WhatsAppMessage }) {
  if (!message.outbound) return null;

  switch (message.status) {
    case "pending":
      return <Clock className="size-3.5" />;
    case "sent":
      return <Check className="size-3.5" />;
    case "delivered":
      return <CheckCheck className="size-3.5" />;
    case "read":
      return <CheckCheck className={cn("size-3.5", WA.tickRead)} />;
    case "failed":
      return <AlertCircle className="size-3.5 text-red-500" />;
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

/**
 * The little tail on the first bubble of a run. WhatsApp draws it as part of
 * the bubble shape; an absolutely-positioned SVG is the closest CSS analogue
 * and keeps the bubble itself a plain rounded box.
 */
function Tail({ outbound }: { outbound: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-0 block size-3 overflow-hidden",
        outbound ? "-right-2" : "-left-2",
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3">
        <path
          d={outbound ? "M0 0 L12 0 L0 12 Z" : "M12 0 L0 0 L12 12 Z"}
          className={cn(
            outbound
              ? "fill-[#d9fdd3] dark:fill-[#005c4b]"
              : "fill-white dark:fill-[#202c33]",
          )}
        />
      </svg>
    </span>
  );
}

export function WhatsAppMessageBubble({
  message,
  canHide,
  onHide,
  /** First of a consecutive run from the same side — only it gets a tail. */
  startsRun = true,
}: {
  message: WhatsAppMessage;
  canHide: boolean;
  onHide: (id: string) => void;
  startsRun?: boolean;
}) {
  const outbound = message.outbound;

  return (
    <div
      className={cn(
        "flex w-full px-1",
        outbound ? "justify-end" : "justify-start",
        startsRun ? "mt-2.5" : "mt-0.5",
      )}
    >
      <div
        className={cn(
          "group relative max-w-[65%] min-w-24 rounded-lg px-2 py-1.5 shadow-sm",
          outbound ? WA.outgoing : WA.incoming,
          WA.text,
          // Square off the corner the tail attaches to.
          startsRun && (outbound ? "rounded-tr-none" : "rounded-tl-none"),
          message.deleted && "opacity-60 ring-1 ring-red-500/50",
        )}
      >
        {startsRun && <Tail outbound={outbound} />}

        {/* Attribution: which rep sent it. WhatsApp shows a group sender name
            in the same position, so this reads naturally. */}
        {outbound && message.sender?.name && (
          <p className="mb-0.5 text-[12.5px] leading-tight font-medium text-[#06cf9c] dark:text-[#53bdeb]">
            {message.sender.name}
          </p>
        )}

        {outbound && message.viaBusinessApp && (
          <p
            className={cn(
              "mb-0.5 flex items-center gap-1 text-[12px] leading-tight font-medium",
              WA.muted,
            )}
          >
            <Smartphone className="size-3" />
            Sent from phone
          </p>
        )}

        {message.isTemplate && (
          <p
            className={cn(
              "mb-1 inline-block rounded px-1.5 py-0.5 text-[10.5px] font-medium",
              "bg-black/5 dark:bg-white/10",
              WA.muted,
            )}
          >
            Paid template{message.templateName && `: ${message.templateName}`}
          </p>
        )}

        {message.attachment && (
          <button
            type="button"
            onClick={() =>
              downloadAuthed(
                message.attachment!.url,
                message.attachment!.name ?? "attachment",
              )
            }
            className="mb-1 flex w-full items-center gap-2.5 rounded-md bg-black/5 px-2.5 py-2 text-left transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <FileText className="size-5 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px]">
                {message.attachment.name ?? "Attachment"}
              </span>
              <span className={cn("block text-[11px]", WA.muted)}>
                {formatBytes(message.attachment.size)}
              </span>
            </span>
            <Download className="size-4 shrink-0 opacity-70" />
          </button>
        )}

        {/* Body and the meta row share a line where they fit, exactly like
            WhatsApp: the timestamp tucks into the last line's trailing space. */}
        {message.body && (
          <span className="text-[14.2px] leading-[19px] whitespace-pre-wrap">
            {message.body}
          </span>
        )}

        <span
          className={cn(
            "float-right mt-1 ml-2 flex translate-y-0.5 items-center gap-1 text-[11px] leading-none",
            WA.bubbleMeta,
          )}
        >
          {message.editedAt && <span className="italic">edited</span>}
          {message.createdAt && (
            <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          )}
          <StatusTicks message={message} />
        </span>
        <span className="clear-both block" />

        {message.status === "failed" && message.errorMessage && (
          <p className="mt-1 text-[11.5px] text-red-500">
            Not delivered — {message.errorMessage}
          </p>
        )}

        {message.deleted && (
          <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-red-500">
            <EyeOff className="size-3" />
            Hidden by {message.deletedBy?.name ?? "a user"}
          </p>
        )}

        {canHide && !message.deleted && (
          <button
            type="button"
            onClick={() => onHide(message.id)}
            title="Hide from inbox (stays in the database and admin audit log)"
            className={cn(
              "absolute -top-1.5 rounded-full border bg-white p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-[#233138]",
              WA.border,
              WA.muted,
              outbound ? "-left-8" : "-right-8",
            )}
          >
            <EyeOff className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
