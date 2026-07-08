import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type { AssignmentFile } from "../types";

interface ListEnvelope {
  data: AssignmentFile[];
}
interface ItemEnvelope {
  data: AssignmentFile;
}

/** Typed API calls for files attached to an assignment. */
export const filesService = {
  async list(assignmentId: string): Promise<AssignmentFile[]> {
    const { data } = await apiClient.get<ListEnvelope>(
      `/assignments/${assignmentId}/files`,
    );
    return data.data;
  },

  async upload(assignmentId: string, file: File): Promise<AssignmentFile> {
    await ensureCsrfCookie();
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${assignmentId}/files`,
      form,
    );
    return data.data;
  },

  async remove(fileId: string): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.delete(`/files/${fileId}`);
  },

  /** Fetch the binary (authorized) and trigger a browser download. */
  async download(file: Pick<AssignmentFile, "id" | "name">): Promise<void> {
    const response = await apiClient.get<Blob>(`/files/${file.id}/download`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
