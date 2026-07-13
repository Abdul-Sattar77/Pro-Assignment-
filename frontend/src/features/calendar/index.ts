/**
 * Public surface of the calendar feature.
 */
export { CalendarView } from "./components/calendar-view";
export { EventDetailDialog } from "./components/event-detail-dialog";
export { CreateEventDialog } from "./components/create-event-dialog";
export {
  useCalendarEvent,
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "./hooks/use-calendar";
export {
  CALENDAR_EVENT_STATUS,
  CALENDAR_EVENT_TYPE,
  type CalendarEvent,
  type CalendarEventStatus,
  type CalendarEventType,
  type CalendarFilters,
  type CreateCalendarEventPayload,
  type UpdateCalendarEventPayload,
} from "./types";
export { EVENT_TYPE_META } from "./constants";
