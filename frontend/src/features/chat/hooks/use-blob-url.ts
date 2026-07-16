"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * Chat attachments are served from an auth-protected route, so a bare
 * <img src> can't load them (no Bearer header). Fetch the blob with the
 * authorized client and hand back a short-lived object URL.
 */
export function useBlobUrl(url: string | null | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    let created: string | null = null;

    apiClient
      .get<Blob>(url, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        created = URL.createObjectURL(res.data);
        setObjectUrl(created);
      })
      .catch(() => {
        /* attachment unavailable — bubble renders a fallback */
      });

    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url]);

  return objectUrl;
}
