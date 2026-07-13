"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { useCreateCalendarEvent } from "../hooks/use-calendar";
import { CALENDAR_EVENT_TYPE, type CalendarEventType } from "../types";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().max(2000).optional().nullable(),
  eventType: z.enum([CALENDAR_EVENT_TYPE.MEETING, CALENDAR_EVENT_TYPE.CUSTOM]),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string; // YYYY-MM-DD
}

export function CreateEventDialog({ open, onOpenChange, defaultDate }: CreateEventDialogProps) {
  const createEvent = useCreateCalendarEvent();

  // Fetch active users for attendee listing
  const { data: users } = useQuery({
    queryKey: ["users", "active-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; name: string }[] }>("/users", {
        params: { "filter[status]": "active", per_page: 100 },
      });
      return data.data;
    },
    enabled: open,
    staleTime: 30 * 1000,
  });

  // Fetch assignments for order links
  const { data: assignments } = useQuery({
    queryKey: ["assignments", "dropdown-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; title: string }[] }>("/assignments", {
        params: { per_page: 100 },
      });
      return data.data;
    },
    enabled: open,
    staleTime: 30 * 1000,
  });

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: CALENDAR_EVENT_TYPE.MEETING,
      startDate: defaultDate ? `${defaultDate}T09:00` : "",
      endDate: "",
      userId: "",
      assignmentId: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      description: values.description === "" ? null : values.description,
      assignmentId: values.assignmentId === "none" || values.assignmentId === "" ? null : values.assignmentId,
      userId: values.userId === "none" || values.userId === "" ? null : values.userId,
      startDate: new Date(values.startDate).toISOString(),
      endDate: values.endDate === "" || !values.endDate ? null : new Date(values.endDate).toISOString(),
    };

    createEvent.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        applyFieldErrors(error, form.setError);
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="text-primary size-5" />
            Schedule an Event
          </DialogTitle>
          <DialogDescription>
            Register manual calendar events such as team meetings or custom follow-ups.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              type="text"
              placeholder="e.g. Sync Meeting / Client Call"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-xs" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description (Optional)</Label>
            <textarea
              id="event-description"
              rows={2}
              placeholder="Meeting details, notes, link, or agenda..."
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Controller
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="event-type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CALENDAR_EVENT_TYPE.MEETING}>Meeting</SelectItem>
                      <SelectItem value={CALENDAR_EVENT_TYPE.CUSTOM}>Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-user">Participant (Optional)</Label>
              <Controller
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <SelectTrigger id="event-user" className="w-full">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start Date & Time</Label>
              <Input
                id="event-start"
                type="datetime-local"
                {...form.register("startDate")}
                aria-invalid={Boolean(errors.startDate)}
              />
              {errors.startDate && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-end">End Date & Time</Label>
              <Input
                id="event-end"
                type="datetime-local"
                {...form.register("endDate")}
                aria-invalid={Boolean(errors.endDate)}
              />
              {errors.endDate && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-assignment">Linked Assignment (Optional)</Label>
            <Controller
              control={form.control}
              name="assignmentId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <SelectTrigger id="event-assignment" className="w-full">
                    <SelectValue placeholder="Select assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {assignments?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {errors.root && (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={createEvent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending && <Loader2 className="size-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
