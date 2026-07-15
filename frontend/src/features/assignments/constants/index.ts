import {
  ASSIGNMENT_STATUS,
  type AcademicLevel,
  type AssignmentFilters,
  type AssignmentPriority,
  type AssignmentStatus,
  type AssignmentType,
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

/** Submission-form option lists (values mirror the backend enums). */
export const ASSIGNMENT_TYPE_OPTIONS: {
  value: AssignmentType;
  label: string;
}[] = [
  { value: "essay", label: "Essay" },
  { value: "report", label: "Report" },
  { value: "research_paper", label: "Research paper" },
  { value: "dissertation", label: "Dissertation" },
  { value: "thesis", label: "Thesis" },
  { value: "coursework", label: "Coursework" },
  { value: "case_study", label: "Case study" },
  { value: "literature_review", label: "Literature review" },
  { value: "presentation", label: "Presentation" },
  { value: "programming", label: "Programming / coding" },
  { value: "editing", label: "Editing & proofreading" },
  { value: "other", label: "Other" },
];

export const ACADEMIC_LEVEL_OPTIONS: {
  value: AcademicLevel;
  label: string;
}[] = [
  { value: "high_school", label: "High school" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
];

/** Common academic referencing styles (stored free-text, chosen from a list). */
export const REFERENCING_STYLE_OPTIONS = [
  "APA",
  "MLA",
  "Harvard",
  "Chicago",
  "IEEE",
  "Vancouver",
  "OSCOLA",
  "Other",
] as const;

export const PRIORITY_OPTIONS: {
  value: AssignmentPriority;
  label: string;
  hint: string;
}[] = [
  { value: "standard", label: "Standard", hint: "Normal turnaround" },
  { value: "urgent", label: "Urgent", hint: "Prioritised — tighter deadline" },
  { value: "critical", label: "Critical", hint: "Rush — earliest possible" },
];

interface PriorityMeta {
  label: string;
  className: string;
}

/** Badge styling per priority for detail/queue surfaces. */
export const PRIORITY_META: Record<AssignmentPriority, PriorityMeta> = {
  standard: {
    label: "Standard",
    className: "text-muted-foreground border-border",
  },
  urgent: {
    label: "Urgent",
    className:
      "text-amber-600 border-amber-500/40 dark:text-amber-400 dark:border-amber-400/40",
  },
  critical: {
    label: "Critical",
    className:
      "text-red-600 border-red-500/40 dark:text-red-400 dark:border-red-400/40",
  },
};
