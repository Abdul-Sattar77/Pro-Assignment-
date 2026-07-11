"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { Message } from "../types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
