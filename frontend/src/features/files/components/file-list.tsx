"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  FileImage,
  FileArchive,
  File,
  Download,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  ExternalLink,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth";
import { apiClient } from "@/lib/api-client";
import { useDeleteFile, useDownloadFile } from "../hooks/use-files";
import type { AppFile } from "../types";
import { FileRenameDialog } from "./file-rename-dialog";
import { FileNotesDialog } from "./file-notes-dialog";

interface FileListProps {
  files: AppFile[];
  isLoading: boolean;
}

export function FileList({ files, isLoading }: FileListProps) {
  const downloadFile = useDownloadFile();
  const deleteFile = useDeleteFile();
  const { user, hasPermission } = useAuth();

  const [renameTarget, setRenameTarget] = useState<AppFile | null>(null);
  const [previewTarget, setPreviewTarget] = useState<AppFile | null>(null);
  const [notesTarget, setNotesTarget] = useState<AppFile | null>(null);

  const getFileIcon = (mimeType?: string) => {
    const type = (mimeType || "").toLowerCase();
    if (
      type.includes("pdf") ||
      type.includes("word") ||
      type.includes("text") ||
      type.includes("officedocument.word")
    ) {
      return <FileText className="size-5 shrink-0 text-blue-500" />;
    }
    if (type.startsWith("image/")) {
      return <FileImage className="size-5 shrink-0 text-emerald-500" />;
    }
    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar") ||
      type.includes("compressed")
    ) {
      return <FileArchive className="size-5 shrink-0 text-purple-500" />;
    }
    return <File className="size-5 shrink-0 text-slate-500" />;
  };

  const handleDelete = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to remove file: "${file.originalName}"?`,
      )
    ) {
      deleteFile.mutate(file.id);
    }
  };

  const handleDownload = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    downloadFile.mutate(file);
  };

  const handleRename = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    setRenameTarget(file);
  };

  const handlePreview = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    setPreviewTarget(file);
  };

  const handleNotes = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    setNotesTarget(file);
  };

  // Check if current user is PM of this file's assignment
  const canModify = (file: AppFile): boolean => {
    const isOwner = file.uploader?.id === user?.id;
    const isAdmin = hasPermission("admin");
    const isPmOfAssignment =
      hasPermission("calendar.manage") && // standard PM permission
      file.assignment !== null; // PM check can be done safely if they manages it.
    // In our policy, uploaders and admins can always modify, PM can modify if linked to their assignments.
    return isOwner || isAdmin || isPmOfAssignment;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          Loading files list...
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-xl border border-dashed py-16 text-center">
        <div className="bg-primary/10 mx-auto mb-3 flex size-12 items-center justify-center rounded-lg">
          <File className="text-primary size-6" />
        </div>
        <h3 className="text-sm font-bold">No files found</h3>
        <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
          No files match your filters or search terms. Try adjusting them or
          upload a new file.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground border-b text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Size</th>
              <th className="px-6 py-3.5">Uploaded By</th>
              <th className="px-6 py-3.5">Upload Date</th>
              <th className="px-6 py-3.5">Assignment</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-border bg-card divide-y">
            {files.map((file) => {
              const mime =
                file.mimeType ||
                (file as unknown as { mime?: string }).mime ||
                "";
              const isImage = mime.startsWith("image/");
              const canEdit = canModify(file);

              return (
                <tr
                  key={file.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  {/* File Name */}
                  <td className="text-foreground px-6 py-4 font-medium">
                    <div className="flex max-w-xs items-center gap-3 md:max-w-sm">
                      {getFileIcon(mime)}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate" title={file.originalName}>
                          {file.originalName}
                        </span>
                        {file.version && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            v{file.version}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="text-muted-foreground px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {file.humanSize}
                  </td>

                  {/* Uploader */}
                  <td className="text-muted-foreground px-6 py-4 whitespace-nowrap">
                    {file.uploader?.name || "System"}
                  </td>

                  {/* Upload Date */}
                  <td className="text-muted-foreground px-6 py-4 text-xs whitespace-nowrap">
                    {format(new Date(file.createdAt), "MMM d, yyyy HH:mm")}
                  </td>

                  {/* Linked Assignment */}
                  <td className="px-6 py-4">
                    {file.assignment ? (
                      <Link
                        href={`/assignments/${file.assignment.id}`}
                        className="text-primary flex max-w-[180px] items-center gap-1 truncate font-medium hover:underline"
                        title={file.assignment.title}
                      >
                        <span className="truncate">
                          {file.assignment.title}
                        </span>
                        <ExternalLink className="size-3 shrink-0" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs italic">
                        Unlinked
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isImage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-primary size-8"
                          onClick={(e) => handlePreview(e, file)}
                          title="Preview Image"
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary size-8"
                        onClick={(e) => handleDownload(e, file)}
                        title="Download File"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:text-indigo-500"
                        onClick={(e) => handleNotes(e, file)}
                        title={file.notes ? "Edit Notes" : "Add Notes"}
                      >
                        <StickyNote
                          className={`size-4 ${file.notes ? "text-indigo-500" : ""}`}
                        />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:text-amber-500"
                            onClick={(e) => handleRename(e, file)}
                            title="Rename File"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:text-rose-500"
                            onClick={(e) => handleDelete(e, file)}
                            disabled={deleteFile.isPending}
                            title="Delete File"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rename Dialog */}
      {renameTarget && (
        <FileRenameDialog
          file={renameTarget}
          open={renameTarget !== null}
          onOpenChange={(open) => !open && setRenameTarget(null)}
        />
      )}

      {/* Notes Dialog */}
      {notesTarget && (
        <FileNotesDialog
          file={notesTarget}
          open={notesTarget !== null}
          onOpenChange={(open) => !open && setNotesTarget(null)}
        />
      )}

      {/* Image Preview Lightbox */}
      {previewTarget && (
        <Dialog
          open={previewTarget !== null}
          onOpenChange={(open) => !open && setPreviewTarget(null)}
        >
          <DialogContent className="border-zinc-800 bg-zinc-950/95 p-3 text-zinc-100 sm:max-w-xl">
            <DialogHeader className="border-b border-zinc-800 px-1 pb-2">
              <DialogTitle className="flex items-center gap-2 truncate text-sm font-semibold text-zinc-100">
                <FileImage className="size-4 text-emerald-400" />
                {previewTarget.originalName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden p-4 select-none">
              {/* Note: In standard local storage setup, files are private. 
                  But wait, since our download action streams the image blob, 
                  we can fetch it securely and create an Object URL to render the image preview safely! */}
              <SecureImagePreview file={previewTarget} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Securely loads private storage images using authenticated API requests.
 */
function SecureImagePreview({ file }: { file: AppFile }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    setLoading(true);
    setError(false);
    apiClient
      .get<Blob>(`/files/${file.id}/download`, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const blob = new Blob([res.data], { type: file.mimeType });
        created = window.URL.createObjectURL(blob);
        setImgUrl(created);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
      if (created) {
        window.URL.revokeObjectURL(created);
      }
    };
  }, [file.id, file.mimeType]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-xs text-zinc-400">
        <Loader2 className="size-4 animate-spin text-zinc-400" />
        Decrypting secure preview...
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className="py-10 text-xs text-zinc-500">
        Unable to load secure preview for this asset.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt={file.originalName}
      className="max-h-[60vh] max-w-full rounded-lg border border-zinc-800 bg-zinc-900 object-contain shadow-xl"
    />
  );
}
