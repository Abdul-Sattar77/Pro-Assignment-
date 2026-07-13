import type { TemplateFilters } from "../types";

export const TEMPLATES_QUERY_KEYS = {
  all: ["templates"] as const,
  list: (filters: TemplateFilters) => ["templates", "list", filters] as const,
};

export const TEMPLATE_CATEGORIES = [
  { value: "outline", label: "Outline" },
  { value: "guideline", label: "Guideline / Criteria" },
  { value: "contract", label: "Writer Contract" },
  { value: "template", label: "Doc Template / Structure" },
  { value: "other", label: "General Document" },
];

export const TEMPLATE_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "title", label: "Title A-Z" },
];
