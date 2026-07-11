"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Conversation } from "../types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Messages</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {conversations.reduce((a, c) => a + c.unreadCount, 0)} unread
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "hover:bg-muted/50 w-full border-b px-4 py-3 text-left transition-colors",
              activeId === conv.id && "bg-muted/70 border-l-primary border-l-2",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {conv.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-medium">
                    {conv.assignmentTitle}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {conv.lastMessage}
                </p>
                <p className="text-muted-foreground/60 mt-0.5 text-[10px]">
                  {formatDistanceToNow(new Date(conv.lastMessageAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
