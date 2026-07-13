/**
 * Assignments domain types — mirror the backend AssignmentResource contract.
 * `actions` = workflow buttons the CURRENT viewer may use (computed by the
 * backend state machine — never decide actions on the frontend).
 */
export const ASSIGNMENT_STATUS = {
  PENDING_ASSIGNMENT: "pending_assignment",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  DELIVERED: "delivered",
  REVISION_REQUESTED: "revision_requested",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

/** Workflow action keys as sent by the backend. */
export type AssignmentAction =
  | "assign"
  | "assign_manager"
  | "accept"
  | "reject"
  | "submit"
  | "return"
  | "deliver"
  | "request_revision"
  | "complete"
  | "cancel";

export const ASSIGNMENT_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type AssignmentPriority =
  (typeof ASSIGNMENT_PRIORITY)[keyof typeof ASSIGNMENT_PRIORITY];

export interface PersonRef {
  id: string;
  name: string;
}

export interface AssignmentEvent {
  id: number;
  type: string;
  label: string;
  note: string | null;
  actor?: { name: string | null };
  createdAt: string | null;
}

export interface AssignmentAttachment {
  id: string;
  type: "file" | "voice_note";
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  humanSize: string;
  url: string;
  uploadedBy?: PersonRef;
  createdAt: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  status: AssignmentStatus;
  statusLabel: string;
  deadline: string;
  priority?: AssignmentPriority;
  priorityLabel?: string;
  wordCount?: number | null;
  notes?: string | null;
  clientPrice?: number;
  writerCost?: number;
  discount?: number;
  netProfit?: number;
  client?: PersonRef;
  writer?: PersonRef | null;
  projectManager?: PersonRef | null;
  events?: AssignmentEvent[];
  attachments?: AssignmentAttachment[];
  actions: AssignmentAction[];
  createdAt: string | null;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AdminAssignmentFilters extends AssignmentFilters {
  priority?: AssignmentPriority;
  writerId?: string;
  projectManagerId?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface AssignmentsPage {
  assignments: Assignment[];
  pagination: PaginationMeta;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  description: string;
  deadline: string;
}

export interface UpdateAssignmentPayload {
  title?: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority?: AssignmentPriority;
  word_count?: number | null;
  notes?: string | null;
  client_price?: number;
  writer_cost?: number;
  discount?: number;
  net_profit?: number;
}
