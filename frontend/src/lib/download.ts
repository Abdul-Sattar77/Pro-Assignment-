import { apiClient } from "@/lib/api-client";

/**
 * Download a Bearer-protected file through the authenticated client and trigger
 * a browser save. A plain <a href> to an /api download route sends no token
 * (auth is a header, not a cookie) and would 401 — always route through this.
 *
 * `url` may be relative (e.g. "/files/{id}/download") or absolute; axios applies
 * the auth interceptor either way.
 */
export async function downloadAuthed(
  url: string,
  filename: string,
): Promise<void> {
  const res = await apiClient.get<Blob>(url, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(res.data);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
