"use client";

import { useRef, useState } from "react";
import { Send, Paperclip, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUploadFile } from "@/features/files";

interface MessageInputProps {
  assignmentId: string;
  onSend: (message: string | null, attachmentId: string | null) => void;
  isSending: boolean;
}

export function MessageInput({ assignmentId, onSend, isSending }: MessageInputProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useUploadFile();

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), null);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Client side size limit check: 50MB
      if (file.size > 52428800) {
        toast.error("File exceeds 50MB upload limit.");
        return;
      }

      toast.info(`Uploading file: ${file.name}...`);

      uploadFile.mutate(
        {
          file,
          assignmentId,
        },
        {
          onSuccess: (uploaded) => {
            // Automatically post the attachment message
            onSend(null, uploaded.id);
            toast.success("Attachment shared.");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          },
          onError: (err) => {
            toast.error(err.message || "Failed to upload attachment.");
          },
        }
      );
    }
  };

  const isUploading = uploadFile.isPending;

  return (
    <div className="p-3 border-t bg-card shrink-0 flex items-end gap-2 relative">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav"
      />

      {/* Attachment Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isSending || isUploading}
        className="size-9 rounded-xl shrink-0"
        title="Share attachment"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <Paperclip className="size-4 text-muted-foreground" />
        )}
      </Button>

      {/* Textarea Input */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isUploading ? "Uploading file..." : "Type a message..."}
        disabled={isSending || isUploading}
        rows={1}
        className="flex-1 min-h-[38px] max-h-[120px] resize-none h-9 py-2 px-3.5 rounded-xl border border-input focus-visible:ring-1 focus-visible:ring-primary shadow-3xs text-xs"
      />

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={isSending || isUploading || !text.trim()}
        size="icon"
        className="size-9 rounded-xl shrink-0"
      >
        {isSending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
