"use client";

import { format } from "date-fns";
import { Download, FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlobUrl } from "../hooks/use-blob-url";
import { VoicePlayer } from "./voice-player";
import type { ChatMessage } from "../types";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Attachment({ message }: { message: ChatMessage }) {
  const att = message.attachment;
  const blobUrl = useBlobUrl(att?.url);

  if (!att) return null;

  if (message.type === "image") {
    return blobUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={blobUrl}
        alt={att.name ?? "image"}
        className="max-h-60 max-w-full rounded-lg object-cover"
      />
    ) : (
      <div className="bg-muted/40 flex h-32 w-40 items-center justify-center rounded-lg">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (message.type === "video") {
    return blobUrl ? (
      <video
        src={blobUrl}
        controls
        className="max-h-60 max-w-full rounded-lg"
      />
    ) : (
      <div className="bg-muted/40 flex h-32 w-48 items-center justify-center rounded-lg">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (message.type === "voice") {
    return blobUrl ? (
      <VoicePlayer src={blobUrl} mine={message.mine} />
    ) : (
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Loader2 className="size-4 animate-spin" /> loading voice note…
      </div>
    );
  }

  // Generic file
  return (
    <a
      href={blobUrl ?? undefined}
      download={att.name ?? "attachment"}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        blobUrl ? "hover:bg-muted/50" : "opacity-70",
      )}
    >
      <FileIcon className="size-4 shrink-0" />
      <span className="max-w-40 truncate">{att.name ?? "file"}</span>
      <span className="text-muted-foreground text-xs">
        {formatBytes(att.size)}
      </span>
      {blobUrl ? (
        <Download className="size-4 shrink-0" />
      ) : (
        <Loader2 className="size-4 shrink-0 animate-spin" />
      )}
    </a>
  );
}

/** A single chat message bubble. `readOnly` hides ownership styling (oversight). */
export function MessageBubble({
  message,
  showSender = false,
}: {
  message: ChatMessage;
  showSender?: boolean;
}) {
  const mine = message.mine;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] space-y-1 rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm",
        )}
      >
        {showSender && !mine && (
          <p className="text-[11px] font-semibold opacity-70">
            {message.sender.name}
          </p>
        )}
        {message.attachment && <Attachment message={message} />}
        {message.body && (
          <p className="break-words whitespace-pre-wrap">{message.body}</p>
        )}
        <p
          className={cn(
            "text-right text-[10px]",
            mine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {message.createdAt
            ? format(new Date(message.createdAt), "HH:mm")
            : ""}
        </p>
      </div>
    </div>
  );
}
