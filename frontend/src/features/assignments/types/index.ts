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
  | "accept"
  | "reject"
  | "submit"
  | "return"
  | "deliver"
  | "request_revision"
  | "complete"
  | "cancel";

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

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  status: AssignmentStatus;
  statusLabel: string;
  deadline: string;
  client?: PersonRef;
  writer?: PersonRef | null;
  projectManager?: PersonRef | null;
  events?: AssignmentEvent[];
  actions: AssignmentAction[];
  createdAt: string | null;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  search?: string;
  page?: number;
  perPage?: number;
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

export type FileCategory = "brief" | "submission" | "general";

export interface AssignmentFile {
  id: string;
  name: string;
  category: FileCategory;
  categoryLabel: string;
  mime: string;
  size: number;
  uploadedBy?: string;
  canDelete: boolean;
  createdAt: string | null;
}
