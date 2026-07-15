import { apiClient } from "@/lib/api-client";
import type {
  AppFile,
  FileFilters,
  RenameFilePayload,
  UploadFilePayload,
} from "../types";

interface Envelope<T> {
  data: T;
}

export const fileService = {
  async list(filters: FileFilters): Promise<AppFile[]> {
    const params: Record<string, string | number> = {};

    if (filters.assignment) params["filter[assignment]"] = filters.assignment;
    if (filters.uploader) params["filter[uploader]"] = filters.uploader;
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.sortOrder) params.sort_order = filters.sortOrder;

    const { data } = await apiClient.get<Envelope<AppFile[]>>("/files", {
      params,
    });
    return data.data;
  },

  async get(id: string): Promise<AppFile> {
    const { data } = await apiClient.get<Envelope<AppFile>>(`/files/${id}`);
    return data.data;
  },

  async upload(payload: UploadFilePayload): Promise<AppFile> {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.assignmentId) {
      formData.append("assignmentId", payload.assignmentId);
    }

    const { data } = await apiClient.post<Envelope<AppFile>>(
      "/files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.data;
  },

  async rename(id: string, payload: RenameFilePayload): Promise<AppFile> {
    const { data } = await apiClient.patch<Envelope<AppFile>>(
      `/files/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/files/${id}`);
  },

  /**
   * Safe authenticated download by requesting blob and saving it.
   */
  async download(file: AppFile): Promise<void> {
    const { data } = await apiClient.get(`/files/${file.id}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([data], { type: file.mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
