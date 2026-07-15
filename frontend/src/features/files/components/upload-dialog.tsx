"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload, FileUp, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadFile } from "../hooks/use-files";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAssignmentId?: string; // Optional assignment linkage pre-fill
}

export function UploadDialog({
  open,
  onOpenChange,
  defaultAssignmentId,
}: UploadDialogProps) {
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignmentId, setAssignmentId] = useState<string>(
    defaultAssignmentId || "none",
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch assignments list for link dropdown
  const { data: assignments } = useQuery({
    queryKey: ["assignments", "upload-dropdown"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: { id: string; title: string }[];
      }>("/assignments", {
        params: { per_page: 100 },
      });
      return data.data;
    },
    enabled: open,
    staleTime: 30 * 1000,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Size check: max 50MB (52,428,800 bytes)
      if (file.size > 52428800) {
        setError("File size exceeds 50MB limit.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 52428800) {
        setError("File size exceeds 50MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    uploadFile.mutate(
      {
        file: selectedFile,
        assignmentId: assignmentId === "none" ? null : assignmentId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFile(null);
          setAssignmentId("none");
          setError(null);
        },
        onError: (err) => {
          setError(err.message || "Failed to upload file.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="text-primary size-5" />
            Upload File
          </DialogTitle>
          <DialogDescription>
            Documents, images, and archives are allowed (Max size: 50MB).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-muted-foreground/30 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors dark:bg-zinc-950/20"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="bg-primary/10 text-primary flex max-w-full items-center gap-2 truncate rounded-lg px-3 py-1 text-sm font-semibold">
                <Upload className="size-4 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                  aria-label="Remove selected file"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm font-medium">
                  Drag & drop your file here, or{" "}
                  <span className="text-primary hover:underline">browse</span>
                </p>
                <p className="text-muted-foreground/75 text-xs">
                  PDF, DOCX, XLSX, PPTX, JPG, PNG, WEBP, ZIP, etc.
                </p>
              </>
            )}
          </div>

          {/* Linked Assignment Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="upload-assignment">
              Link to Assignment (Optional)
            </Label>
            <Select
              onValueChange={(v) => setAssignmentId(v)}
              value={assignmentId}
            >
              <SelectTrigger id="upload-assignment" className="w-full">
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assignments?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <DialogFooter className="border-t pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedFile(null);
                setError(null);
              }}
              disabled={uploadFile.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploadFile.isPending}
            >
              {uploadFile.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
