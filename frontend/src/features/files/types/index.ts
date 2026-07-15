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
