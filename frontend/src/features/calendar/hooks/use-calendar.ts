"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { CALENDAR_QUERY_KEYS } from "../constants";
import { calendarService } from "../services/calendar-service";
import type {
  CalendarEvent,
  CalendarFilters,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "../types";

export function useCalendarEvents(filters: CalendarFilters) {
  return useQuery<CalendarEvent[], ApiError>({
    queryKey: CALENDAR_QUERY_KEYS.list(filters),
    queryFn: () => calendarService.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useCalendarEvent(id: string) {
  return useQuery<CalendarEvent, ApiError>({
    queryKey: CALENDAR_QUERY_KEYS.detail(id),
    queryFn: () => calendarService.get(id),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation<CalendarEvent, ApiError, CreateCalendarEventPayload>({
    mutationFn: (payload) => calendarService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CALENDAR_QUERY_KEYS.all,
      });
      toast.success("Calendar event registered successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to create event."),
  });
}

export function useUpdateCalendarEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<CalendarEvent, ApiError, UpdateCalendarEventPayload>({
    mutationFn: (payload) => calendarService.update(eventId, payload),
    onSuccess: (event) => {
      queryClient.setQueryData(CALENDAR_QUERY_KEYS.detail(eventId), event);
      void queryClient.invalidateQueries({
        queryKey: CALENDAR_QUERY_KEYS.all,
      });
      toast.success("Calendar event updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update event."),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => calendarService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CALENDAR_QUERY_KEYS.all,
      });
      toast.success("Calendar event removed.");
    },
    onError: (error) => toast.error(error.message || "Failed to remove event."),
  });
}
