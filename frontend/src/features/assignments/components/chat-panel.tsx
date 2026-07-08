"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, MessageSquare, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMessages, useSendMessage } from "../hooks/use-messages";

/**
 * Per-order chat thread. Everyone on the order shares one conversation.
 * Polls for new messages (realtime-ready). Own messages align right.
 */
export function ChatPanel({ assignmentId }: { assignmentId: string }) {
  const [body, setBody] = useState("");
  const { data: messages, isPending } = useMessages(assignmentId);
  const send = useSendMessage(assignmentId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    send.mutate(trimmed, { onSuccess: () => setBody("") });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Messages
        </CardTitle>
        <CardDescription>
          Chat with everyone working on this order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/30 mb-3 max-h-96 min-h-40 space-y-3 overflow-y-auto rounded-lg border p-4">
          {isPending && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading conversation…
            </div>
          )}

          {messages && messages.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No messages yet. Say hello or ask a question.
            </p>
          )}

          {messages?.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.mine ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                  message.mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card rounded-bl-sm border",
                )}
              >
                {!message.mine && (
                  <p className="text-muted-foreground mb-0.5 text-xs font-medium">
                    {message.sender}
                  </p>
                )}
                <p className="break-words whitespace-pre-wrap">
                  {message.body}
                </p>
              </div>
              {message.createdAt && (
                <p className="text-muted-foreground mt-1 px-1 text-[10px]">
                  {format(new Date(message.createdAt), "MMM d, HH:mm")}
                </p>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(event);
              }
            }}
            rows={1}
            placeholder="Type a message… (Enter to send, Shift+Enter for a new line)"
            className="border-input focus-visible:ring-ring/50 max-h-32 min-h-10 flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={send.isPending || body.trim().length === 0}
          >
            {send.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
