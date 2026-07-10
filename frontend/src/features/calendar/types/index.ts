export type EventType = "assignment" | "task" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  priority?: "low" | "medium" | "high";
}
