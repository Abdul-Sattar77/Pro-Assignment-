"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WA } from "../theme";
import type { SendWhatsAppPayload, WhatsAppConversation } from "../types";

/**
 * Reply box, styled as WhatsApp's composer bar.
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
      <div className={cn("px-4 py-3", WA.header)}>
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-medium", WA.text)}>
              24-hour reply window closed
            </p>
            <p className={cn("mt-0.5 text-xs", WA.muted)}>
              WhatsApp only allows free replies within 24 hours of the
              customer&apos;s last message. To reopen the chat you must send an
              approved template, which <strong>Meta charges for</strong>. The
              customer messaging again reopens the free window at no cost.
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
    <div className={cn("px-4 py-2.5", WA.header)}>
      {file && (
        <div
          className={cn(
            "mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            WA.input,
            WA.text,
          )}
        >
          <Paperclip className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            className={WA.muted}
          >
            <X className="size-4" />
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

        <button
          type="button"
          disabled
          title="Emoji picker is not part of this integration"
          className={cn("shrink-0 p-2 opacity-40", WA.muted)}
        >
          <Smile className="size-6" />
        </button>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          title="Attach a file"
          className={cn(
            "shrink-0 p-2 transition-opacity hover:opacity-70",
            WA.muted,
          )}
        >
          <Paperclip className="size-6" />
        </button>

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
          placeholder="Type a message"
          className={cn(
            "max-h-32 min-h-11 flex-1 resize-none rounded-lg px-4 py-3 text-[15px] leading-tight",
            "placeholder:text-[#8696a0] focus-visible:outline-none",
            WA.input,
            WA.text,
          )}
        />

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          title="Send"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-colors",
            WA.accent,
            !canSubmit && "opacity-40",
          )}
        >
          {sending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
