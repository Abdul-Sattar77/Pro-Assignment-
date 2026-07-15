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

export function ChatWindow({ conversation, messages, isLoading }: ChatWindowProps) {
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
    if (type.includes("pdf") || type.includes("word") || type.includes("text")) {
      return <FileText className="size-5 text-blue-500 shrink-0" />;
    }
    if (type.startsWith("image/")) {
      return <FileImage className="size-5 text-emerald-500 shrink-0" />;
    }
    if (type.includes("zip") || type.includes("rar")) {
      return <FileArchive className="size-5 text-purple-500 shrink-0" />;
    }
    return <File className="size-5 text-slate-500 shrink-0" />;
  };

  const handleDownloadAttachment = (attachment: Exclude<Message["attachment"], null | undefined>) => {
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
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/20 text-foreground">
      {/* Header */}
      <div className="p-4 border-b bg-card shrink-0 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold truncate max-w-[240px] md:max-w-md">
            {conversation.assignment.title}
          </h3>
          <p className="text-2xs text-muted-foreground font-medium">
            {conversation.type === "client" ? "Client Channel" : "Writer Channel"} — Status:{" "}
            <span className="capitalize font-semibold text-primary">
              {conversation.assignment.status.replace("_", " ")}
            </span>
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <FileText className="size-5 text-primary" />
            </div>
            <h4 className="text-sm font-bold">Start the discussion</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Type your message below to communicate with participants regarding this assignment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender?.id === user?.id;
              const showDelete = !msg.isDeleted && (isMe || isAdmin || (hasPermission("calendar.manage") && conversation.assignment.status !== "completed"));

              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col gap-1 w-full max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-3xs font-bold text-muted-foreground">
                      {msg.sender?.name || "System"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/80">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-xs shadow-3xs group relative flex flex-col gap-2 transition-all",
                      msg.isDeleted
                        ? "bg-muted text-muted-foreground italic border border-dashed border-muted-foreground/30"
                        : isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card text-card-foreground rounded-tl-none border"
                    )}
                  >
                    {/* Render Text Body */}
                    <div className="whitespace-pre-wrap leading-relaxed select-text font-medium">
                      {msg.message}
                    </div>

                    {/* Admin raw view badge */}
                    {msg.isDeleted && isAdmin && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold border border-rose-300 bg-rose-100 dark:bg-rose-950/20 px-2 py-0.5 rounded-full mt-1 shrink-0 select-none">
                        <ShieldAlert className="size-3" />
                        Deleted Message (Admin view)
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {msg.attachment && (
                      <div
                        onClick={() => handleDownloadAttachment(msg.attachment!)}
                        className={cn(
                          "flex items-center gap-3 border rounded-xl p-2 cursor-pointer transition-all hover:opacity-95 select-none mt-1",
                          isMe
                            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                            : "bg-muted/40 hover:bg-muted/75 text-card-foreground"
                        )}
                        title="Click to Download"
                      >
                        {getFileIcon(msg.attachment.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate">
                            {msg.attachment.originalName}
                          </p>
                          <p className="text-[10px] opacity-75">{msg.attachment.humanSize}</p>
                        </div>
                        <Download className="size-4 shrink-0 opacity-80" />
                      </div>
                    )}

                    {/* Image Render */}
                    {msg.messageType === "image" && msg.attachment && (
                      <div className="rounded-lg overflow-hidden border mt-1 max-w-xs md:max-w-sm max-h-[220px] shadow-sm select-none">
                        <SecureImageLoader attachmentId={msg.attachment.id} mimeType={msg.attachment.mimeType} />
                      </div>
                    )}

                    {/* Delete Message Button */}
                    {showDelete && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border rounded-full p-1.5 shadow-2xs hover:text-rose-500",
                          isMe ? "-left-10" : "-right-10"
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
function SecureImageLoader({ attachmentId, mimeType }: { attachmentId: string; mimeType: string }) {
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
      <div className="flex items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-900">
        <Loader2 className="size-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!imgUrl) {
    return (
      <div className="p-4 bg-muted text-3xs text-muted-foreground italic">
        Failed to load image preview
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt="attachment"
      className="w-full h-auto max-h-[220px] object-cover cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => window.open(imgUrl, "_blank")}
    />
  );
}
