import {
  LEAD_SOURCE,
  LEAD_STATUS,
  type LeadFilters,
  type LeadSource,
  type LeadStatus,
} from "../types";

/** React Query keys. */
export const LEADS_QUERY_KEYS = {
  all: ["leads"] as const,
  list: (filters: LeadFilters) => ["leads", "list", filters] as const,
  detail: (id: string) => ["leads", "detail", id] as const,
};

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  [LEAD_STATUS.NEW]: {
    label: "New",
    dotClass: "bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400",
  },
  [LEAD_STATUS.QUOTED]: {
    label: "Quoted",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400",
  },
  [LEAD_STATUS.NEGOTIATING]: {
    label: "Negotiating",
    dotClass: "bg-purple-500",
    textClass: "text-purple-600 dark:text-purple-400",
    badgeClass: "border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400",
  },
  [LEAD_STATUS.WON]: {
    label: "Won",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400",
  },
  [LEAD_STATUS.LOST]: {
    label: "Lost",
    dotClass: "bg-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400",
  },
};

export const STATUS_FILTER_OPTIONS = Object.entries(STATUS_META).map(
  ([value, meta]) => ({ value: value as LeadStatus, label: meta.label }),
);

interface SourceMeta {
  label: string;
  badgeClass: string;
}

export const SOURCE_META: Record<LeadSource, SourceMeta> = {
  [LEAD_SOURCE.INSTAGRAM]: {
    label: "Instagram",
    badgeClass: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  },
  [LEAD_SOURCE.WHATSAPP]: {
    label: "WhatsApp",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [LEAD_SOURCE.REFERRAL]: {
    label: "Referral",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
  [LEAD_SOURCE.OTHER]: {
    label: "Other",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

export const SOURCE_FILTER_OPTIONS = Object.entries(SOURCE_META).map(
  ([value, meta]) => ({ value: value as LeadSource, label: meta.label }),
);

export const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
];
