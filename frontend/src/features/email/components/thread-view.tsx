"use client";

import { useRef, useState } from "react";
import { Archive, Loader2, Paperclip, Send, UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/http-error";
import {
  useArchiveEmailThread,
  useEmailMessages,
  useHideEmailMessage,
  useSendEmail,
} from "../hooks/use-email";
import { GM } from "../theme";
import type { EmailThread } from "../types";
import { EmailMessageCard } from "./message-card";

export function EmailThreadView({
  thread,
  canHide,
  canSend,
  onError,
}: {
  thread: EmailThread;
  canHide: boolean;
  canSend: boolean;
  onError: (message: string) => void;
}) {
  const { data: messages = [], isPending } = useEmailMessages(thread.id);
  const send = useSendEmail(thread.id);
  const hide = useHideEmailMessage(thread.id);
  const archive = useArchiveEmailThread();

  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (body.trim() === "" || send.isPending) return;

    send.mutate(
      { body: body.trim(), files },
      {
        onSuccess: () => {
          setBody("");
          setFiles([]);
          if (fileInput.current) fileInput.current.value = "";
        },
        onError: (error) =>
          onError(
            error instanceof ApiError
              ? error.message
              : "Could not send the email. Please try again.",
          ),
      },
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ---- Header ---- */}
      <div
        className={cn(
          "flex shrink-0 items-start justify-between gap-3 border-b px-5 py-3",
          GM.border,
        )}
      >
        <div className="min-w-0">
          <h2 className={cn("truncate text-[18px] leading-tight", GM.text)}>
            {thread.subject}
          </h2>
          <p className={cn("mt-0.5 truncate text-[12.5px]", GM.muted)}>
            {thread.contact.name ?? thread.contact.email}
            {thread.contact.email && thread.contact.name
              ? ` <${thread.contact.email}>`
              : ""}
            {thread.portalUser && ` · ${thread.portalUser.name} (portal user)`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className={cn("flex items-center gap-1 text-[12px]", GM.muted)}>
            <UserCheck className="size-3.5" />
            {thread.assignedTo?.name ?? "Unassigned"}
          </span>
          <button
            type="button"
            onClick={() =>
              archive.mutate({
                threadId: thread.id,
                archived: !thread.isArchived,
              })
            }
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-[12px] hover:bg-black/5 dark:hover:bg-white/5",
              GM.muted,
            )}
          >
            <Archive className="size-3.5" />
            {thread.isArchived ? "Unarchive" : "Archive"}
          </button>
        </div>
      </div>

      {/* ---- Messages ---- */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {isPending ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className={cn("size-5 animate-spin", GM.muted)} />
          </div>
        ) : messages.length === 0 ? (
          <p className={cn("py-10 text-center text-sm", GM.muted)}>
            No messages in this thread.
          </p>
        ) : (
          messages.map((m, i) => (
            <EmailMessageCard
              key={m.id}
              message={m}
              // Gmail expands the newest message and collapses the rest.
              defaultOpen={i === messages.length - 1}
              canHide={canHide}
              onHide={(id) => hide.mutate(id)}
            />
          ))
        )}
      </div>

      {/* ---- Reply ---- */}
      {canSend && (
        <div
          className={cn("shrink-0 border-t px-5 py-3", GM.border, GM.toolbar)}
        >
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2 py-1 text-[11.5px]",
                    GM.chip,
                  )}
                >
                  <Paperclip className="size-3" />
                  {f.name}
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl/Cmd+Enter sends, matching Gmail. Plain Enter must insert
              // a newline — email bodies are multi-paragraph by nature.
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={3}
            placeholder={`Reply to ${thread.contact.name ?? thread.contact.email ?? "this thread"}…`}
            className={cn(
              "w-full resize-none rounded-lg border px-3 py-2 text-[14px]",
              "focus-visible:ring-1 focus-visible:ring-[#0b57d0] focus-visible:outline-none",
              GM.raised,
              GM.border,
              GM.text,
            )}
          />

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={body.trim() === "" || send.isPending}
              onClick={submit}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-[14px] font-medium text-white transition-colors",
                GM.accent,
                (body.trim() === "" || send.isPending) && "opacity-40",
              )}
            >
              {send.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send
            </button>

            <input
              ref={fileInput}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              title="Attach files"
              className={cn(
                "rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5",
                GM.muted,
              )}
            >
              <Paperclip className="size-4" />
            </button>

            <span className={cn("ml-auto text-[11.5px]", GM.muted)}>
              Ctrl+Enter to send
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
