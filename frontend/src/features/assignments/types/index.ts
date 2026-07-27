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

export type AssignmentType =
  | "essay"
  | "report"
  | "research_paper"
  | "dissertation"
  | "thesis"
  | "coursework"
  | "case_study"
  | "literature_review"
  | "presentation"
  | "programming"
  | "editing"
  | "other";

export type AcademicLevel = "high_school" | "undergraduate" | "masters" | "phd";

/**
 * Priority values are anchored to the backend AssignmentPriority enum
 * (main branch). The const is exposed so admin-panel components can iterate
 * priorities without hardcoding strings.
 */
export const ASSIGNMENT_PRIORITY = {
  STANDARD: "standard",
  URGENT: "urgent",
  CRITICAL: "critical",
} as const;

export type AssignmentPriority =
  (typeof ASSIGNMENT_PRIORITY)[keyof typeof ASSIGNMENT_PRIORITY];

/** Attachment / voice-note on an assignment (admin panel). */
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
  type: AssignmentType | null;
  typeLabel: string | null;
  academicLevel: AcademicLevel | null;
  academicLevelLabel: string | null;
  course: string | null;
  university: string | null;
  wordCount: number | null;
  referencingStyle: string | null;
  priority: AssignmentPriority;
  priorityLabel: string;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  description: string;
  status: AssignmentStatus;
  statusLabel: string;
  deadline: string;
  // Admin-panel cost/notes fields (optional; populated by admin endpoints).
  notes?: string | null;
  clientPrice?: number;
  writerCost?: number;
  additionalCosts?: number;
  discount?: number;
  totalCost?: number;
  netProfit?: number;
  profitMargin?: number;
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

/** Extended filters used by the admin assignments queue. */
export interface AdminAssignmentFilters extends AssignmentFilters {
  priority?: AssignmentPriority;
  writerId?: string;
  projectManagerId?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sort?: string;
}

/** Partial update payload for the admin edit dialog. */
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
  type?: AssignmentType | null;
  academic_level?: AcademicLevel | null;
  course?: string | null;
  university?: string | null;
  word_count?: number | null;
  referencing_style?: string | null;
  priority?: AssignmentPriority;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  description: string;
  deadline: string;
  projectManagerId?: string | null;
  project_manager_id?: string | null;
}

export type FileCategory = "brief" | "submission" | "general";

export interface AssignmentFile {
  id: string;
  name: string;
  note: string | null;
  category: FileCategory;
  categoryLabel: string;
  mime: string;
  size: number;
  uploadedBy?: string;
  canDelete: boolean;
  createdAt: string | null;
}

export interface Message {
  id: string;
  body: string;
  sender?: string;
  mine: boolean;
  createdAt: string | null;
}
