"use client";

import { useRef } from "react";
import { Loader2, Mic, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteAttachment,
  useUploadAttachment,
} from "../hooks/use-assignments";
import type { AssignmentAttachment } from "../types";

interface VoiceNotesListProps {
  assignmentId: string;
  attachments: AssignmentAttachment[];
  loading?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
}

/**
 * Lists voice note attachments with an inline HTML audio player.
 * Upload button accepts audio formats (mp3, wav, ogg, m4a, webm).
 */
export function VoiceNotesList({
  assignmentId,
  attachments,
  loading,
  canUpload = false,
  canDelete = false,
}: VoiceNotesListProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAttachment(assignmentId);
  const remove = useDeleteAttachment(assignmentId);

  const voiceNotes = attachments.filter((a) => a.type === "voice_note");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ file, type: "voice_note" });
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      {loading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && voiceNotes.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No voice notes yet.
        </p>
      )}

      {!loading && voiceNotes.length > 0 && (
        <ul className="space-y-3">
          {voiceNotes.map((note) => (
            <li key={note.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="text-primary size-4" />
                  <span className="text-sm font-medium">
                    {note.originalName ?? "Voice note"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-xs">
                    {note.humanSize}
                    {note.createdAt &&
                      ` · ${format(new Date(note.createdAt), "MMM d, HH:mm")}`}
                  </span>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive ml-1 size-7"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate({ attachmentId: note.id })}
                    >
                      {remove.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      <span className="sr-only">Delete voice note</span>
                    </Button>
                  )}
                </div>
              </div>
              {/* Native audio player — works with any served audio MIME */}
              <audio
                controls
                src={note.url}
                className="h-9 w-full"
                preload="metadata"
              />
            </li>
          ))}
        </ul>
      )}

      {canUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mic className="size-4" />
            )}
            Upload voice note
          </Button>
        </>
      )}
    </div>
  );
}
