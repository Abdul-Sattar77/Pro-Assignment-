/**
 * Calendar domain types.
 */
export const CALENDAR_EVENT_TYPE = {
  ASSIGNMENT_DEADLINE: "assignment_deadline",
  WRITER_DEADLINE: "writer_deadline",
  PAYMENT_DUE: "payment_due",
  MEETING: "meeting",
  CUSTOM: "custom",
} as const;

export type CalendarEventType =
  (typeof CALENDAR_EVENT_TYPE)[keyof typeof CALENDAR_EVENT_TYPE];

export const CALENDAR_EVENT_STATUS = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type CalendarEventStatus =
  (typeof CALENDAR_EVENT_STATUS)[keyof typeof CALENDAR_EVENT_STATUS];

export interface CalendarEventRef {
  id: string; // uuid
  title: string;
}

export interface CalendarEventUserRef {
  id: string; // uuid
  name: string;
  email: string;
}

export interface CalendarEvent {
  id: string; // uuid
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  eventTypeLabel: string;
  startDate: string;
  endDate: string | null;
  status: CalendarEventStatus;
  statusLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  assignment?: CalendarEventRef | null;
  task?: CalendarEventRef | null;
  user?: CalendarEventUserRef | null;
  creator?: CalendarEventUserRef | null;
}

export interface CalendarFilters {
  month?: string; // YYYY-MM
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  eventType?: CalendarEventType;
  assignment?: string; // uuid
  user?: string; // uuid
  status?: CalendarEventStatus;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string | null;
  eventType: CalendarEventType;
  startDate: string;
  endDate?: string | null;
  assignmentId?: string | null;
  taskId?: string | null;
  userId?: string | null;
  status?: CalendarEventStatus;
}

export interface UpdateCalendarEventPayload {
  title?: string;
  description?: string | null;
  eventType?: CalendarEventType;
  startDate?: string;
  endDate?: string | null;
  assignmentId?: string | null;
  taskId?: string | null;
  userId?: string | null;
  status?: CalendarEventStatus;
}
