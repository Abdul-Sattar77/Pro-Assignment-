"use client";

import { useState } from "react";
import { MessageSquare, Search, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "../types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = conversations.filter((c) => {
    const titleMatch = c.assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const snippetMatch = c.latestMessage?.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || snippetMatch;
  });

  return (
    <div className="flex flex-col h-full border-r bg-card text-card-foreground">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3 shrink-0">
        <h2 className="text-lg font-bold tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Conversations scroll area */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <span className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Loading chats...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageSquare className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold">No discussions found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              {searchTerm ? "Try another search term" : "No active chats linked to your assignments"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((c) => {
              const isSelected = selectedId === c.id;
              const hasUnread = c.unreadCount > 0;

              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl transition-all duration-200 flex flex-col gap-1.5 outline-none select-none relative",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-bold text-sm truncate max-w-[170px]" title={c.assignment.title}>
                      {c.assignment.title}
                    </span>
                    <span
                      className={cn(
                        "text-2xs font-medium shrink-0",
                        isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                      )}
                    >
                      {c.type === "client" ? "Client Channel" : "Writer Channel"}
                    </span>
                  </div>

                  {c.latestMessage ? (
                    <div className="flex flex-col gap-0.5 w-full">
                      <p
                        className={cn(
                          "text-xs truncate w-full",
                          isSelected
                            ? "text-primary-foreground/90"
                            : hasUnread
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {c.latestMessage.message}
                      </p>
                      <span
                        className={cn(
                          "text-2xs truncate",
                          isSelected ? "text-primary-foreground/70" : "text-muted-foreground/80"
                        )}
                      >
                        {c.latestMessage.sender.name}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "text-xs italic",
                        isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60"
                      )}
                    >
                      No messages yet
                    </span>
                  )}

                  {/* Unread count badge */}
                  {hasUnread && !isSelected && (
                    <Badge
                      variant="default"
                      className="absolute right-3.5 bottom-3.5 size-5 flex items-center justify-center p-0 text-3xs rounded-full font-bold shadow-xs bg-rose-500 hover:bg-rose-600 text-white"
                    >
                      {c.unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
