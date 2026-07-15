import type { ComplaintFilters } from "../types";

export const COMPLAINTS_QUERY_KEYS = {
  all: ["complaints"] as const,
  list: (filters: ComplaintFilters) => ["complaints", "list", filters] as const,
  detail: (id: string) => ["complaints", "detail", id] as const,
};

interface StatusMeta {
  label: string;
  badgeClass: string;
}

export const COMPLAINT_STATUS_META: Record<string, StatusMeta> = {
  pending: {
    label: "Pending",
    badgeClass:
      "border-slate-500/30 bg-slate-500/10 text-slate-650 dark:text-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  resolved: {
    label: "Resolved",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  dismissed: {
    label: "Dismissed",
    badgeClass:
      "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-450",
  },
};
export const COMPLAINT_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "subject", label: "Subject A-Z" },
];
