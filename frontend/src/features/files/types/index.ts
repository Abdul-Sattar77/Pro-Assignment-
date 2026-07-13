/**
 * Files domain types.
 */
export interface FileRef {
  id: string; // uuid
  title: string;
}

export interface FileUploaderRef {
  id: string; // uuid
  name: string;
  email: string;
}

export interface AppFile {
  id: string; // uuid
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
  assignment?: string; // uuid
  uploader?: string; // uuid
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
