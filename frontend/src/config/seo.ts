import { env } from "./env";

/**
 * Single source of truth for site-wide SEO metadata. Consumed by the root
 * layout, sitemap, robots, manifest, OG image, and JSON-LD.
 */
export const SITE = {
  name: "Prossignment",
  /** Default <title> when a page sets none. */
  title: "Prossignment — Academic Writing & Assignment Help",
  /** Title template: page titles render as "Page · Prossignment". */
  titleTemplate: "%s · Prossignment",
  tagline: "The pros for your assignments",
  description:
    "Professional academic writing, research, dissertations, theses, programming, editing and proofreading from vetted subject experts. Submit your assignment, get matched with an expert, and track every step to polished, grade-ready work.",
  url: env.appUrl.replace(/\/$/, ""),
  locale: "en_US",
  twitter: "@prossignment",
  keywords: [
    "academic writing service",
    "assignment help",
    "dissertation writing",
    "thesis help",
    "essay writing service",
    "research paper help",
    "programming assignment help",
    "proofreading and editing",
    "coursework help",
    "Prossignment",
  ],
} as const;
