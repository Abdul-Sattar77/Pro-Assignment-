import {
  ASSIGNMENT_STATUS,
  type AssignmentFilters,
  type AssignmentStatus,
} from "../types";

/** React Query keys. */
export const ASSIGNMENTS_QUERY_KEYS = {
  all: ["assignments"] as const,
  list: (filters: AssignmentFilters) =>
    ["assignments", "list", filters] as const,
  detail: (id: string) => ["assignments", "detail", id] as const,
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
