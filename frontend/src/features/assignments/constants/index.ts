import {
  ASSIGNMENT_PRIORITY,
  ASSIGNMENT_STATUS,
  type AdminAssignmentFilters,
  type AssignmentPriority,
  type AssignmentStatus,
} from "../types";

/** React Query keys. */
export const ASSIGNMENTS_QUERY_KEYS = {
  all: ["assignments"] as const,
  list: (filters: AdminAssignmentFilters) =>
    ["assignments", "list", filters] as const,
  detail: (id: string) => ["assignments", "detail", id] as const,
  attachments: (id: string) => ["assignments", "attachments", id] as const,
};

interface StatusMeta {
  label: string;
  /** Tailwind classes for the badge dot + text. */
  dotClass: string;
  textClass: string;
}

/** Display metadata per workflow status (label mirrors backend). */
export const STATUS_META: Record<AssignmentStatus, StatusMeta> = {
  [ASSIGNMENT_STATUS.PENDING_ASSIGNMENT]: {
    label: "Awaiting assignment",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  [ASSIGNMENT_STATUS.ASSIGNED]: {
    label: "Writer assigned",
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  [ASSIGNMENT_STATUS.IN_PROGRESS]: {
    label: "In progress",
    dotClass: "bg-sky-500",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  [ASSIGNMENT_STATUS.SUBMITTED]: {
    label: "Submitted for review",
    dotClass: "bg-violet-500",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  [ASSIGNMENT_STATUS.DELIVERED]: {
    label: "Delivered to client",
    dotClass: "bg-teal-500",
    textClass: "text-teal-600 dark:text-teal-400",
  },
  [ASSIGNMENT_STATUS.REVISION_REQUESTED]: {
    label: "Revision requested",
    dotClass: "bg-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  [ASSIGNMENT_STATUS.COMPLETED]: {
    label: "Completed",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  [ASSIGNMENT_STATUS.CANCELLED]: {
    label: "Cancelled",
    dotClass: "bg-muted-foreground",
    textClass: "text-muted-foreground",
  },
};

/** Options for the status filter select on the queue. */
export const STATUS_FILTER_OPTIONS = Object.entries(STATUS_META).map(
  ([value, meta]) => ({ value: value as AssignmentStatus, label: meta.label }),
);

interface PriorityMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const PRIORITY_META: Record<AssignmentPriority, PriorityMeta> = {
  [ASSIGNMENT_PRIORITY.LOW]: {
    label: "Low",
    dotClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeClass: "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
  },
  [ASSIGNMENT_PRIORITY.NORMAL]: {
    label: "Normal",
    dotClass: "bg-sky-400",
    textClass: "text-sky-600 dark:text-sky-400",
    badgeClass: "border-sky-200 text-sky-600 dark:border-sky-800 dark:text-sky-400",
  },
  [ASSIGNMENT_PRIORITY.HIGH]: {
    label: "High",
    dotClass: "bg-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
    badgeClass: "border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400",
  },
  [ASSIGNMENT_PRIORITY.URGENT]: {
    label: "Urgent",
    dotClass: "bg-destructive",
    textClass: "text-destructive",
    badgeClass: "border-red-200 text-destructive dark:border-red-900",
  },
};

export const PRIORITY_FILTER_OPTIONS = Object.entries(PRIORITY_META).map(
  ([value, meta]) => ({ value: value as AssignmentPriority, label: meta.label }),
);

export const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "deadline", label: "Deadline (asc)" },
  { value: "-deadline", label: "Deadline (desc)" },
  { value: "title", label: "Title A–Z" },
  { value: "-priority", label: "Priority (urgent first)" },
];
