"use client";

import { useEffect, useState } from "react";
import { Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRenameFile } from "../hooks/use-files";
import type { AppFile } from "../types";

interface FileRenameDialogProps {
  file: AppFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileRenameDialog({ file, open, onOpenChange }: FileRenameDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const renameFile = useRenameFile(file?.id || "");

  useEffect(() => {
    if (file) {
      // Strip extension from input helper to let user rename base file cleanly
      const nameParts = file.originalName.split(".");
      if (nameParts.length > 1) {
        setName(nameParts.slice(0, -1).join("."));
      } else {
        setName(file.originalName);
      }
    }
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("File name cannot be empty.");
      return;
    }

    renameFile.mutate(
      { filename: name.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          setError(null);
        },
        onError: (err) => {
          setError(err.message || "Failed to rename file.");
        },
      }
    );
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="text-primary size-5" />
            Rename File
          </DialogTitle>
          <DialogDescription>
            Modify the name of the file resource. The original file extension will be preserved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-input">File Name</Label>
            <Input
              id="rename-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. essay_revision"
              autoFocus
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setError(null);
              }}
              disabled={renameFile.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={renameFile.isPending || !name.trim()}>
              {renameFile.isPending && <Loader2 className="size-4 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
