"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Download,
  FileText,
  FileImage,
  FileArchive,
  File,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/auth";
import { fileService } from "@/features/files/services/file-service";
import type { AppFile } from "@/features/files";
import { apiClient } from "@/lib/api-client";
import { useDeleteMessage } from "../hooks/use-messaging";
import type { Conversation, Message } from "../types";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  isLoading,
}: ChatWindowProps) {
  const { user, hasPermission } = useAuth();
  const deleteMessage = useDeleteMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = hasPermission("admin");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDelete = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage.mutate(messageId);
    }
  };

  const getFileIcon = (mimeType: string) => {
    const type = mimeType.toLowerCase();
    if (
      type.includes("pdf") ||
      type.includes("word") ||
      type.includes("text")
    ) {
      return <FileText className="size-5 shrink-0 text-blue-500" />;
    }
    if (type.startsWith("image/")) {
      return <FileImage className="size-5 shrink-0 text-emerald-500" />;
    }
    if (type.includes("zip") || type.includes("rar")) {
      return <FileArchive className="size-5 shrink-0 text-purple-500" />;
    }
    return <File className="size-5 shrink-0 text-slate-500" />;
  };

  const handleDownloadAttachment = (
    attachment: Exclude<Message["attachment"], null | undefined>,
  ) => {
    // Create a mock AppFile model to pass to fileService.download
    const fileMock: AppFile = {
      id: attachment.id,
      filename: attachment.originalName,
      originalName: attachment.originalName,
      size: attachment.size,
      humanSize: attachment.humanSize,
      mimeType: attachment.mimeType,
      downloadUrl: attachment.downloadUrl,
      createdAt: new Date().toISOString(),
    };
    void fileService.download(fileMock);
  };

  return (
    <div className="text-foreground flex h-full flex-col bg-zinc-50 dark:bg-zinc-950/20">
      {/* Header */}
      <div className="bg-card flex shrink-0 items-center justify-between border-b p-4 shadow-2xs">
        <div>
          <h3 className="max-w-[240px] truncate text-sm font-bold md:max-w-md">
            {conversation.assignment.title}
          </h3>
          <p className="text-2xs text-muted-foreground font-medium">
            {conversation.type === "client"
              ? "Client Channel"
              : "Writer Channel"}{" "}
            — Status:{" "}
            <span className="text-primary font-semibold capitalize">
              {conversation.assignment.status.replace("_", " ")}
            </span>
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <Loader2 className="text-primary size-6 animate-spin" />
            <p className="text-muted-foreground text-xs font-medium">
              Loading chat history...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-primary/10 mb-3 flex size-12 items-center justify-center rounded-full">
              <FileText className="text-primary size-5" />
            </div>
            <h4 className="text-sm font-bold">Start the discussion</h4>
            <p className="text-muted-foreground mt-1 max-w-xs text-xs">
              Type your message below to communicate with participants regarding
              this assignment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender?.id === user?.id;
              const showDelete =
                !msg.isDeleted &&
                (isMe ||
                  isAdmin ||
                  (hasPermission("calendar.manage") &&
                    conversation.assignment.status !== "completed"));

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full max-w-[80%] flex-col gap-1",
                    isMe ? "ml-auto items-end" : "mr-auto items-start",
                  )}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-3xs text-muted-foreground font-bold">
                      {msg.sender?.name || "System"}
                    </span>
                    <span className="text-muted-foreground/80 text-[9px]">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "shadow-3xs group relative flex flex-col gap-2 rounded-2xl px-4 py-2.5 text-xs transition-all",
                      msg.isDeleted
                        ? "bg-muted text-muted-foreground border-muted-foreground/30 border border-dashed italic"
                        : isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card text-card-foreground rounded-tl-none border",
                    )}
                  >
                    {/* Render Text Body */}
                    <div className="leading-relaxed font-medium whitespace-pre-wrap select-text">
                      {msg.message}
                    </div>

                    {/* Admin raw view badge */}
                    {msg.isDeleted && isAdmin && (
                      <div className="mt-1 flex shrink-0 items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-500 select-none dark:bg-rose-950/20">
                        <ShieldAlert className="size-3" />
                        Deleted Message (Admin view)
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {msg.attachment && (
                      <div
                        onClick={() =>
                          handleDownloadAttachment(msg.attachment!)
                        }
                        className={cn(
                          "mt-1 flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-all select-none hover:opacity-95",
                          isMe
                            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                            : "bg-muted/40 hover:bg-muted/75 text-card-foreground",
                        )}
                        title="Click to Download"
                      >
                        {getFileIcon(msg.attachment.mimeType)}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold">
                            {msg.attachment.originalName}
                          </p>
                          <p className="text-[10px] opacity-75">
                            {msg.attachment.humanSize}
                          </p>
                        </div>
                        <Download className="size-4 shrink-0 opacity-80" />
                      </div>
                    )}

                    {/* Image Render */}
                    {msg.messageType === "image" && msg.attachment && (
                      <div className="mt-1 max-h-[220px] max-w-xs overflow-hidden rounded-lg border shadow-sm select-none md:max-w-sm">
                        <SecureImageLoader
                          attachmentId={msg.attachment.id}
                          mimeType={msg.attachment.mimeType}
                        />
                      </div>
                    )}

                    {/* Delete Message Button */}
                    {showDelete && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className={cn(
                          "bg-card absolute top-1/2 -translate-y-1/2 rounded-full border p-1.5 opacity-0 shadow-2xs transition-opacity group-hover:opacity-100 hover:text-rose-500",
                          isMe ? "-left-10" : "-right-10",
                        )}
                        title="Delete Message"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/**
 * Image loader to securely download and display private attachments via object URLs.
 */
function SecureImageLoader({
  attachmentId,
  mimeType,
}: {
  attachmentId: string;
  mimeType: string;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient
      .get(`/files/${attachmentId}/download`, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const blob = new Blob([res.data], { type: mimeType });
        setImgUrl(window.URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (imgUrl) {
        window.URL.revokeObjectURL(imgUrl);
      }
    };
  }, [attachmentId, mimeType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-zinc-100 p-8 dark:bg-zinc-900">
        <Loader2 className="size-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!imgUrl) {
    return (
      <div className="bg-muted text-3xs text-muted-foreground p-4 italic">
        Failed to load image preview
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt="attachment"
      className="h-auto max-h-[220px] w-full cursor-pointer object-cover transition-transform hover:scale-[1.01]"
      onClick={() => window.open(imgUrl, "_blank")}
    />
  );
}
