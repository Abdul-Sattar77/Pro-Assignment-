"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  pm: "bg-primary/10 text-primary",
  client: "bg-blue-500/10 text-blue-500",
  writer: "bg-amber-500/10 text-amber-500",
  admin: "bg-red-500/10 text-red-500",
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex max-w-[80%] gap-2",
        isOwn && "ml-auto flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          ROLE_COLORS[message.senderRole] ?? "bg-muted text-muted-foreground",
        )}
      >
        {message.senderName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className={cn("space-y-1", isOwn && "flex flex-col items-end")}>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {isOwn ? "You" : message.senderName}
          </span>
          <span className="text-muted-foreground/60 text-[10px]">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
