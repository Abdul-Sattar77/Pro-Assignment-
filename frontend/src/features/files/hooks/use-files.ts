"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { FILES_QUERY_KEYS } from "../constants";
import { fileService } from "../services/file-service";
import type { AppFile, FileFilters, RenameFilePayload, UploadFilePayload } from "../types";

export function useFiles(filters: FileFilters) {
  return useQuery<AppFile[], ApiError>({
    queryKey: FILES_QUERY_KEYS.list(filters),
    queryFn: () => fileService.list(filters),
    staleTime: 15 * 1000,
  });
}

export function useFile(id: string) {
  return useQuery<AppFile, ApiError>({
    queryKey: FILES_QUERY_KEYS.detail(id),
    queryFn: () => fileService.get(id),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation<AppFile, ApiError, UploadFilePayload>({
    mutationFn: (payload) => fileService.upload(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FILES_QUERY_KEYS.all,
      });
      toast.success("File uploaded successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to upload file."),
  });
}

export function useRenameFile(fileId: string) {
  const queryClient = useQueryClient();

  return useMutation<AppFile, ApiError, RenameFilePayload>({
    mutationFn: (payload) => fileService.rename(fileId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(FILES_QUERY_KEYS.detail(fileId), updated);
      void queryClient.invalidateQueries({
        queryKey: FILES_QUERY_KEYS.all,
      });
      toast.success("File renamed successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to rename file."),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => fileService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FILES_QUERY_KEYS.all,
      });
      toast.success("File removed.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete file."),
  });
}

export function useDownloadFile() {
  return useMutation<void, ApiError, AppFile>({
    mutationFn: (file) => fileService.download(file),
    onSuccess: () => {
      toast.success("Download started.");
    },
    onError: (error) => toast.error(error.message || "Download failed."),
  });
}
