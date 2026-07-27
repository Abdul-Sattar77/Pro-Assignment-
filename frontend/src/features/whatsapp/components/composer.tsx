"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Loader2, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SendWhatsAppPayload, WhatsAppConversation } from "../types";

/**
 * Reply box.
 *
 * When the 24-hour service window has closed, free-form replies are blocked at
 * the UI level rather than letting Meta reject them: the only path is an
 * approved template, which costs money, so it is an explicit, deliberate click.
 */
export function WhatsAppComposer({
  conversation,
  sending,
  sendingTemplate,
  onSend,
  onSendTemplate,
}: {
  conversation: WhatsAppConversation;
  sending: boolean;
  sendingTemplate: boolean;
  onSend: (payload: SendWhatsAppPayload) => void;
  onSendTemplate: () => void;
}) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const windowOpen = conversation.withinServiceWindow;
  const canSubmit = (body.trim() !== "" || file !== null) && !sending;

  const submit = () => {
    if (!canSubmit) return;
    onSend({ body: body.trim() || undefined, file: file ?? undefined });
    setBody("");
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  if (!windowOpen) {
    return (
      <div className="border-t p-4">
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">24-hour reply window closed</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              WhatsApp only allows free replies within 24 hours of the
              customer&apos;s last message. To reopen the chat you must send an
              approved template, which <strong>Meta charges for</strong>. The
              customer can also simply message again — that reopens the free
              window at no cost.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={sendingTemplate}
              onClick={onSendTemplate}
            >
              {sendingTemplate ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              Send paid template to reopen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t p-3">
      {file && (
        <div className="bg-muted mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs">
          <Paperclip className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0"
          onClick={() => fileInput.current?.click()}
        >
          <Paperclip className="size-4" />
        </Button>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={4096}
          placeholder="Type a reply…  (Enter to send, Shift+Enter for a new line)"
          className={cn(
            "border-input bg-background max-h-32 min-h-[38px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
        />

        <Button
          type="button"
          size="icon"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
          disabled={!canSubmit}
          onClick={submit}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
