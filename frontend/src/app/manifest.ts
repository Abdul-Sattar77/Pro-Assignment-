import type { MetadataRoute } from "next";
import { SITE } from "@/config/seo";

/** PWA / install manifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#080d1c",
    theme_color: "#3b82f6",
    categories: ["education", "productivity"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
