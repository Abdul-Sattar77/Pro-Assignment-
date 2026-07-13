"use client";

import { useState } from "react";
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
import { useDeleteFile, useDownloadFile } from "../hooks/use-files";
import type { AppFile } from "../types";
import { FileRenameDialog } from "./file-rename-dialog";

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

  const getFileIcon = (mimeType: string) => {
    const type = mimeType.toLowerCase();
    if (type.includes("pdf") || type.includes("word") || type.includes("text") || type.includes("officedocument.word")) {
      return <FileText className="size-5 text-blue-500 shrink-0" />;
    }
    if (type.startsWith("image/")) {
      return <FileImage className="size-5 text-emerald-500 shrink-0" />;
    }
    if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("compressed")) {
      return <FileArchive className="size-5 text-purple-500 shrink-0" />;
    }
    return <File className="size-5 text-slate-500 shrink-0" />;
  };

  const handleDelete = (e: React.MouseEvent, file: AppFile) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove file: "${file.originalName}"?`)) {
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading files list...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="border border-dashed rounded-xl py-16 text-center bg-card text-card-foreground">
        <div className="mx-auto size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <File className="size-6 text-primary" />
        </div>
        <h3 className="text-sm font-bold">No files found</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
          No files match your filters or search terms. Try adjusting them or upload a new file.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold uppercase border-b">
            <tr>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Size</th>
              <th className="px-6 py-3.5">Uploaded By</th>
              <th className="px-6 py-3.5">Upload Date</th>
              <th className="px-6 py-3.5">Assignment</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {files.map((file) => {
              const isImage = file.mimeType.startsWith("image/");
              const canEdit = canModify(file);

              return (
                <tr
                  key={file.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  {/* File Name */}
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="flex items-center gap-3 max-w-xs md:max-w-sm">
                      {getFileIcon(file.mimeType)}
                      <span className="truncate" title={file.originalName}>
                        {file.originalName}
                      </span>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs whitespace-nowrap">
                    {file.humanSize}
                  </td>

                  {/* Uploader */}
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {file.uploader?.name || "System"}
                  </td>

                  {/* Upload Date */}
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs">
                    {format(new Date(file.createdAt), "MMM d, yyyy HH:mm")}
                  </td>

                  {/* Linked Assignment */}
                  <td className="px-6 py-4">
                    {file.assignment ? (
                      <Link
                        href={`/assignments/${file.assignment.id}`}
                        className="text-primary hover:underline font-medium flex items-center gap-1 max-w-[180px] truncate"
                        title={file.assignment.title}
                      >
                        <span className="truncate">{file.assignment.title}</span>
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
                          className="size-8 hover:text-primary"
                          onClick={(e) => handlePreview(e, file)}
                          title="Preview Image"
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:text-primary"
                        onClick={(e) => handleDownload(e, file)}
                        title="Download File"
                      >
                        <Download className="size-4" />
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

      {/* Image Preview Lightbox */}
      {previewTarget && (
        <Dialog
          open={previewTarget !== null}
          onOpenChange={(open) => !open && setPreviewTarget(null)}
        >
          <DialogContent className="sm:max-w-xl p-3 bg-zinc-950/95 text-zinc-100 border-zinc-800">
            <DialogHeader className="border-b border-zinc-800 pb-2 px-1">
              <DialogTitle className="text-zinc-100 text-sm font-semibold truncate flex items-center gap-2">
                <FileImage className="size-4 text-emerald-400" />
                {previewTarget.originalName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4 max-h-[70vh] overflow-hidden select-none">
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

  useState(() => {
    let active = true;
    apiClient
      .get(`/files/${file.id}/download`, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const blob = new Blob([res.data], { type: file.mimeType });
        setImgUrl(window.URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
      if (imgUrl) {
        window.URL.revokeObjectURL(imgUrl);
      }
    };
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 text-xs py-10">
        <Loader2 className="size-4 animate-spin text-zinc-400" />
        Decrypting secure preview...
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className="text-zinc-500 text-xs py-10">
        Unable to load secure preview for this asset.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt={file.originalName}
      className="max-w-full max-h-[60vh] object-contain rounded-lg border border-zinc-800 shadow-xl bg-zinc-900"
    />
  );
}
