export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    downloadUrl: string;
  } | null;
  uploader: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface TemplateFilters {
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface CreateTemplatePayload {
  title: string;
  category: string;
  description?: string;
  fileId?: string | null;
}
