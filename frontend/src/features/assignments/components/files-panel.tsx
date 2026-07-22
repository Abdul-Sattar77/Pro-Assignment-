"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteFile,
  useDownloadFile,
  useFiles,
  useUploadFile,
} from "../hooks/use-files";
import { filesService } from "../services/files-service";
import type { AssignmentFile } from "../types";

/** Human-readable file size. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORY_CLASS: Record<AssignmentFile["category"], string> = {
  brief: "text-amber-600 dark:text-amber-400",
  submission: "text-violet-600 dark:text-violet-400",
  general: "text-muted-foreground",
};

/** Files a browser can render inline (image or PDF). */
function isPreviewable(mime: string): boolean {
  return mime.startsWith("image/") || mime === "application/pdf";
}

/**
 * Files attached to an order — upload, list, download, delete. Shown on the
 * detail page for everyone who can view the order; anyone with files.upload
 * can add (client → brief, writer → submission, staff → attachment).
 */
export function FilesPanel({ assignmentId }: { assignmentId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: files, isPending } = useFiles(assignmentId);
  const upload = useUploadFile(assignmentId);
  const remove = useDeleteFile(assignmentId);
  const { download, downloadingId } = useDownloadFile();

  const [preview, setPreview] = useState<{
    file: AssignmentFile;
    url: string;
  } | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Free the object URL when the preview closes or the component unmounts.
  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview?.url]);

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate({ file });
    event.target.value = ""; // allow re-selecting the same file
  };

  const openPreview = async (file: AssignmentFile) => {
    setPreviewingId(file.id);
    try {
      const url = await filesService.previewUrl(file.id);
      setPreview({ file, url });
    } catch {
      toast.error("Couldn't open a preview. Try downloading instead.");
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="size-4" />
            Files
          </CardTitle>
          <CardDescription>Briefs, drafts, and deliverables.</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={onPick}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.m4a,.txt"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending &&
          Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}

        {files && files.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No files yet. Upload the brief or your work to get started.
          </p>
        )}

        {files?.map((file) => (
          <div
            key={file.id}
            className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
          >
            <FileText className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className={CATEGORY_CLASS[file.category]}>
                  {file.categoryLabel}
                </span>
                <span>·</span>
                <span className="tabular-nums">{formatSize(file.size)}</span>
                {file.uploadedBy && (
                  <>
                    <span>·</span>
                    <span className="truncate">{file.uploadedBy}</span>
                  </>
                )}
              </p>
              {file.note && (
                <p className="text-muted-foreground mt-1 text-xs italic">
                  “{file.note}”
                </p>
              )}
            </div>
            {isPreviewable(file.mime) && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Preview ${file.name}`}
                onClick={() => openPreview(file)}
                disabled={previewingId === file.id}
              >
                {previewingId === file.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Download ${file.name}`}
              onClick={() => download(file)}
              disabled={downloadingId === file.id}
            >
              {downloadingId === file.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
            {file.canDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${file.name}`}
                onClick={() => remove.mutate(file)}
                disabled={remove.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">
              {preview?.file.name}
            </DialogTitle>
          </DialogHeader>
          {preview &&
            (preview.file.mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.url}
                alt={preview.file.name}
                className="mx-auto max-h-[70vh] w-auto rounded-md object-contain"
              />
            ) : (
              <iframe
                src={preview.url}
                title={preview.file.name}
                className="h-[70vh] w-full rounded-md border"
              />
            ))}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
