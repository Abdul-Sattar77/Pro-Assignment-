"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useMessages } from "../hooks/use-chat";
import { Composer } from "./composer";
import { MessageBubble } from "./message-bubble";

/** Active conversation: scrolling message list + composer. */
export function ChatThread({ conversationId }: { conversationId: string }) {
  const { data: messages, isPending } = useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {isPending && (
          <div className="text-muted-foreground flex justify-center py-8">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
        {messages?.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet — say hello 👋
          </p>
        )}
        {messages?.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
      <Composer conversationId={conversationId} />
    </div>
  );
}
