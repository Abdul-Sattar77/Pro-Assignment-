import {
  CALENDAR_EVENT_STATUS,
  CALENDAR_EVENT_TYPE,
  type CalendarEventType,
  type CalendarEventStatus,
  type CalendarFilters,
} from "../types";

export const CALENDAR_QUERY_KEYS = {
  all: ["calendar"] as const,
  list: (filters: CalendarFilters) => ["calendar", "list", filters] as const,
  detail: (id: string) => ["calendar", "detail", id] as const,
};

interface EventTypeMeta {
  label: string;
  dotClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const EVENT_TYPE_META: Record<CalendarEventType, EventTypeMeta> = {
  [CALENDAR_EVENT_TYPE.ASSIGNMENT_DEADLINE]: {
    label: "Assignment Deadline",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-50/80 dark:bg-blue-950/20",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-200 dark:border-blue-900/50",
  },
  [CALENDAR_EVENT_TYPE.WRITER_DEADLINE]: {
    label: "Writer Deadline",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50/80 dark:bg-amber-950/20",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-200 dark:border-amber-900/50",
  },
  [CALENDAR_EVENT_TYPE.PAYMENT_DUE]: {
    label: "Payment Due",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50/80 dark:bg-emerald-950/20",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-200 dark:border-emerald-900/50",
  },
  [CALENDAR_EVENT_TYPE.MEETING]: {
    label: "Meeting",
    dotClass: "bg-purple-500",
    bgClass: "bg-purple-50/80 dark:bg-purple-950/20",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-200 dark:border-purple-900/50",
  },
  [CALENDAR_EVENT_TYPE.CUSTOM]: {
    label: "Custom Event",
    dotClass: "bg-slate-500",
    bgClass: "bg-slate-50/80 dark:bg-slate-900/30",
    textClass: "text-slate-700 dark:text-slate-300",
    borderClass: "border-slate-200 dark:border-slate-800",
  },
};

export const TYPE_FILTER_OPTIONS = Object.entries(EVENT_TYPE_META).map(
  ([value, meta]) => ({ value: value as CalendarEventType, label: meta.label }),
);

interface StatusMeta {
  label: string;
  bgClass: string;
  textClass: string;
}

export const STATUS_META: Record<CalendarEventStatus, StatusMeta> = {
  [CALENDAR_EVENT_STATUS.UPCOMING]: {
    label: "Upcoming",
    bgClass: "bg-sky-100 dark:bg-sky-950/40",
    textClass: "text-sky-700 dark:text-sky-300",
  },
  [CALENDAR_EVENT_STATUS.COMPLETED]: {
    label: "Completed",
    bgClass: "bg-emerald-100 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-300",
  },
  [CALENDAR_EVENT_STATUS.CANCELLED]: {
    label: "Cancelled",
    bgClass: "bg-rose-100 dark:bg-rose-950/40",
    textClass: "text-rose-700 dark:text-rose-300",
  },
};
