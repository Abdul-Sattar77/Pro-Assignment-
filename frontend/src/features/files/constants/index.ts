import { type FileFilters } from "../types";

export const FILES_QUERY_KEYS = {
  all: ["files"] as const,
  list: (filters: FileFilters) => ["files", "list", filters] as const,
  detail: (id: string) => ["files", "detail", id] as const,
};

export const FILE_TYPE_OPTIONS = [
  { value: "document", label: "Documents" },
  { value: "image", label: "Images" },
  { value: "archive", label: "Archives" },
] as const;

export const SORT_BY_OPTIONS = [
  { value: "created_at", label: "Upload Date" },
  { value: "original_name", label: "File Name" },
  { value: "size", label: "File Size" },
] as const;
