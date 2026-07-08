"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { filesService } from "../services/files-service";
import type { AssignmentFile } from "../types";

const filesKey = (assignmentId: string) =>
  ["assignments", "files", assignmentId] as const;

export function useFiles(assignmentId: string) {
  return useQuery<AssignmentFile[], ApiError>({
    queryKey: filesKey(assignmentId),
    queryFn: () => filesService.list(assignmentId),
  });
}

export function useUploadFile(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<AssignmentFile, ApiError, File>({
    mutationFn: (file) => filesService.upload(assignmentId, file),
    onSuccess: (file) => {
      void queryClient.invalidateQueries({ queryKey: filesKey(assignmentId) });
      toast.success(`${file.name} uploaded.`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteFile(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, AssignmentFile>({
    mutationFn: (file) => filesService.remove(file.id),
    onSuccess: (_data, file) => {
      void queryClient.invalidateQueries({ queryKey: filesKey(assignmentId) });
      toast.success(`${file.name} removed.`);
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Download handler with per-file pending state (not cached). */
export function useDownloadFile() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = async (file: AssignmentFile) => {
    setDownloadingId(file.id);
    try {
      await filesService.download(file);
    } catch {
      toast.error("Couldn't download that file. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return { download, downloadingId };
}
