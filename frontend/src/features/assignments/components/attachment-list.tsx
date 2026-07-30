"use client";

import { useRef, useState } from "react";
import {
  FileText,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  Loader2,
  Paperclip,
  Trash2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteAttachment,
  useUploadAttachment,
} from "../hooks/use-assignments";
import type { AssignmentAttachment } from "../types";
import { assignmentsService } from "../services/assignments-service";
import { toast } from "sonner";

function fileIcon(mime: string | null) {
  if (!mime) return <FileText className="size-4" />;
  if (mime.startsWith("image/"))
    return <FileImage className="size-4 text-sky-500" />;
  if (mime.includes("spreadsheet") || mime.includes("excel"))
    return <FileSpreadsheet className="size-4 text-emerald-500" />;
  if (mime.includes("zip") || mime.includes("compressed"))
    return <FileArchive className="size-4 text-amber-500" />;
  return <FileText className="text-primary size-4" />;
}

interface AttachmentListProps {
  assignmentId: string;
  attachments: AssignmentAttachment[];
  loading?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
}

/**
 * Lists file attachments (not voice notes) with download links.
 * Upload and delete actions are gated by props (derived from the user's role).
 */
export function AttachmentList({
  assignmentId,
  attachments,
  loading,
  canUpload = false,
  canDelete = false,
}: AttachmentListProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAttachment(assignmentId);
  const remove = useDeleteAttachment(assignmentId);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const files = attachments.filter((a) => a.type === "file");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ file, type: "file" });
    // Reset so the same file can be re-uploaded if needed
    event.target.value = "";
  };

  const handleDownload = async (file: AssignmentAttachment) => {
    if (!file.originalName) return;
    setDownloadingId(file.id);
    try {
      await assignmentsService.downloadAttachment(
        assignmentId,
        file.id,
        file.originalName,
      );
    } catch (err) {
      toast.error("Couldn't download that attachment. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!loading && files.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No files attached yet.
        </p>
      )}

      {!loading && files.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 px-4 py-3">
              {fileIcon(file.mimeType)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {file.originalName ?? "Untitled file"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {file.humanSize}
                  {file.uploadedBy && <> · by {file.uploadedBy.name}</>}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={downloadingId === file.id}
                  onClick={() => handleDownload(file)}
                >
                  {downloadingId === file.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  <span className="sr-only">
                    Download {file.originalName}
                  </span>
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive size-8"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate({ attachmentId: file.id })}
                  >
                    {remove.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    <span className="sr-only">Delete {file.originalName}</span>
                  </Button>
                )}
              </div>
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
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.webp"
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
              <Paperclip className="size-4" />
            )}
            Attach file
          </Button>
        </>
      )}
    </div>
  );
}
