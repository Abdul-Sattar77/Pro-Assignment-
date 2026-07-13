/**
 * Tasks domain types — mirror the backend TaskResource contract.
 */
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  UNDER_REVIEW: "under_review",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export interface TaskRef {
  id: string; // uuid
  title: string;
}

export interface UserRef {
  id: string; // uuid
  name: string;
  email: string;
}

export interface Task {
  id: string; // uuid
  title: string;
  description: string | null;
  priority: TaskPriority;
  priorityLabel: string;
  status: TaskStatus;
  statusLabel: string;
  dueDate: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  assignment?: TaskRef | null;
  assignedUser?: UserRef | null;
  creator?: UserRef | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUser?: string; // uuid
  assignment?: string; // uuid
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface TasksPage {
  tasks: Task[];
  pagination: PaginationMeta;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  assignmentId?: string | null;
  assignedUserId?: string | null;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  notes?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  assignmentId?: string | null;
  assignedUserId?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  notes?: string | null;
}
