import {
  TASK_PRIORITY,
  TASK_STATUS,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
} from "../types";

/** React Query keys. */
export const TASKS_QUERY_KEYS = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  [TASK_STATUS.TODO]: {
    label: "To Do",
    dotClass: "bg-slate-400",
    textClass: "text-slate-600 dark:text-slate-400",
    badgeClass: "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400",
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    dotClass: "bg-sky-500",
    textClass: "text-sky-600 dark:text-sky-400",
    badgeClass: "border-sky-200 text-sky-600 dark:border-sky-800 dark:text-sky-400",
  },
  [TASK_STATUS.UNDER_REVIEW]: {
    label: "Under Review",
    dotClass: "bg-violet-500",
    textClass: "text-violet-600 dark:text-violet-400",
    badgeClass: "border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400",
  },
  [TASK_STATUS.COMPLETED]: {
    label: "Completed",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400",
  },
  [TASK_STATUS.CANCELLED]: {
    label: "Cancelled",
    dotClass: "bg-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400",
  },
};

export const STATUS_FILTER_OPTIONS = Object.entries(STATUS_META).map(
  ([value, meta]) => ({ value: value as TaskStatus, label: meta.label }),
);

interface PriorityMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  [TASK_PRIORITY.LOW]: {
    label: "Low",
    dotClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeClass: "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: "Medium",
    dotClass: "bg-blue-400",
    textClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400",
  },
  [TASK_PRIORITY.HIGH]: {
    label: "High",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400",
  },
  [TASK_PRIORITY.URGENT]: {
    label: "Urgent",
    dotClass: "bg-destructive",
    textClass: "text-destructive",
    badgeClass: "border-red-200 text-destructive dark:border-red-900",
  },
};

export const PRIORITY_FILTER_OPTIONS = Object.entries(PRIORITY_META).map(
  ([value, meta]) => ({ value: value as TaskPriority, label: meta.label }),
);

export const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "due_date", label: "Due date (earliest)" },
  { value: "-due_date", label: "Due date (latest)" },
  { value: "title", label: "Title A–Z" },
];
