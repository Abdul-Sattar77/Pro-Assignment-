export type FileType = "pdf" | "docx" | "xlsx" | "image" | "other";
export type FileUploadedBy = "client" | "writer" | "pm" | "admin";

export interface AssignmentFile {
  id: string;
  name: string;
  size: number;
  type: FileType;
  uploadedBy: FileUploadedBy;
  uploaderName: string;
  assignmentId: string;
  assignmentTitle: string;
  uploadedAt: string;
  url: string;
}

/* -------------------------------------------------------------------------
 * Admin file manager (net-new) — standalone file entity + filters.
 * ---------------------------------------------------------------------- */

export interface FileRef {
  id: string;
  title: string;
}

export interface FileUploaderRef {
  id: string;
  name: string;
  email: string;
}

export interface AppFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  humanSize: string;
  mimeType: string;
  downloadUrl: string;
  createdAt: string;
  assignment?: FileRef | null;
  uploader?: FileUploaderRef | null;
}

export interface FileFilters {
  assignment?: string;
  uploader?: string;
  search?: string;
  type?: "document" | "image" | "archive";
  sortBy?: "created_at" | "original_name" | "size";
  sortOrder?: "asc" | "desc";
}

export interface UploadFilePayload {
  file: File;
  assignmentId?: string | null;
}

export interface RenameFilePayload {
  filename: string;
}
