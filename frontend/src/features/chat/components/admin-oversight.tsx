"use client";

import { useState } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminConversations, useAdminMessages } from "../hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { roleLabel } from "./conversation-list";

/**
 * Admin oversight: read-only view of every conversation on the platform.
 * (Admins observe; they don't post into others' threads.)
 */
export function AdminChatOversight() {
  const { data: conversations = [], isPending } = useAdminConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: messages, isPending: messagesPending } =
    useAdminMessages(activeId);

  return (
    <div className="grid h-[560px] grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className="min-h-0 overflow-y-auto border-b md:border-r md:border-b-0">
        {isPending ? (
          <div className="text-muted-foreground flex justify-center py-8">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center text-sm">
            No conversations yet.
          </p>
        ) : (
          <ul>
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "hover:bg-muted/50 w-full px-4 py-3 text-left transition-colors",
                    activeId === c.id && "bg-muted",
                  )}
                >
                  <p className="truncate text-sm font-medium">
                    {c.contact?.name ?? "Conversation"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {c.lastMessage?.type === "text"
                      ? c.lastMessage.body
                      : c.lastMessage
                        ? `📎 ${c.lastMessage.type}`
                        : roleLabel(c.contact?.role ?? null)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Thread (read-only) */}
      <div className="min-h-0 overflow-y-auto p-3">
        {!activeId ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-sm">
            <MessagesSquare className="size-8 opacity-50" />
            Select a conversation to review.
          </div>
        ) : messagesPending ? (
          <div className="text-muted-foreground flex justify-center py-8">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {messages?.map((message) => (
              <MessageBubble key={message.id} message={message} showSender />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
