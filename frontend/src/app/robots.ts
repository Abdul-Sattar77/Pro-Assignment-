import type { MetadataRoute } from "next";
import { SITE } from "@/config/seo";

/** Allow the public marketing site; keep the internal portal out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/assignments",
        "/finance",
        "/messaging",
        "/messages",
        "/users",
        "/leads",
        "/tasks",
        "/calendar",
        "/reports",
        "/analytics",
        "/settings",
        "/chat-admin",
        "/complaints",
        "/api/",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
