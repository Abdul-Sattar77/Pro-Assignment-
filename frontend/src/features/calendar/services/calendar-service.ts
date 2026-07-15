import { apiClient } from "@/lib/api-client";
import type {
  CalendarEvent,
  CalendarFilters,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "../types";

interface Envelope<T> {
  data: T;
}

export const calendarService = {
  async list(filters: CalendarFilters): Promise<CalendarEvent[]> {
    const params: Record<string, string | number> = {};

    if (filters.month) params.month = filters.month;
    if (filters.date) params.date = filters.date;
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    if (filters.eventType) params["filter[eventType]"] = filters.eventType;
    if (filters.assignment) params["filter[assignment]"] = filters.assignment;
    if (filters.user) params["filter[user]"] = filters.user;
    if (filters.status) params["filter[status]"] = filters.status;

    const { data } = await apiClient.get<Envelope<CalendarEvent[]>>(
      "/calendar",
      {
        params,
      },
    );
    return data.data;
  },

  async get(id: string): Promise<CalendarEvent> {
    const { data } = await apiClient.get<Envelope<CalendarEvent>>(
      `/calendar/${id}`,
    );
    return data.data;
  },

  async create(payload: CreateCalendarEventPayload): Promise<CalendarEvent> {
    const { data } = await apiClient.post<Envelope<CalendarEvent>>(
      "/calendar",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: UpdateCalendarEventPayload,
  ): Promise<CalendarEvent> {
    const { data } = await apiClient.patch<Envelope<CalendarEvent>>(
      `/calendar/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/calendar/${id}`);
  },
};
