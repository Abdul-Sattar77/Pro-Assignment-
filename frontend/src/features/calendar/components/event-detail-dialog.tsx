"use client";

import { format } from "date-fns";
import { Loader2, Calendar, Link2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth";
import { useDeleteCalendarEvent } from "../hooks/use-calendar";
import { EVENT_TYPE_META, STATUS_META } from "../constants";
import { CALENDAR_EVENT_TYPE, type CalendarEvent } from "../types";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  const deleteEvent = useDeleteCalendarEvent();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("calendar.manage");

  if (!event) return null;

  const typeMeta = EVENT_TYPE_META[event.eventType];
  const statusMeta = STATUS_META[event.status];

  // Auto-synced event categories cannot be edited/deleted manually
  const isAutoEvent = [
    CALENDAR_EVENT_TYPE.ASSIGNMENT_DEADLINE,
    CALENDAR_EVENT_TYPE.WRITER_DEADLINE,
    CALENDAR_EVENT_TYPE.PAYMENT_DUE,
  ].includes(event.eventType);

  const handleDelete = () => {
    if (
      window.confirm(`Are you sure you want to remove event: "${event.title}"?`)
    ) {
      deleteEvent.mutate(event.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${typeMeta?.dotClass}`} />
            <DialogTitle className="text-lg font-bold">
              {event.title}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-1 font-mono text-xs tracking-wider uppercase">
            {event.eventTypeLabel} · Status: {event.statusLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {event.description && (
            <div>
              <h4 className="text-muted-foreground text-xs font-semibold uppercase">
                Description
              </h4>
              <p className="mt-1 text-sm whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-muted-foreground text-xs font-semibold uppercase">
                Start Date
              </h4>
              <p className="mt-1 text-sm font-medium">
                {format(new Date(event.startDate), "MMM d, yyyy HH:mm")}
              </p>
            </div>
            {event.endDate && (
              <div>
                <h4 className="text-muted-foreground text-xs font-semibold uppercase">
                  End Date
                </h4>
                <p className="mt-1 text-sm font-medium">
                  {format(new Date(event.endDate), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            )}
          </div>

          {(event.assignment || event.task || event.user) && (
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Related Items
              </h4>
              {event.assignment && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="text-primary size-4" />
                  <span className="text-muted-foreground">Assignment:</span>
                  <Link
                    href={`/assignments/${event.assignment.id}`}
                    onClick={() => onOpenChange(false)}
                    className="text-primary font-medium hover:underline"
                  >
                    {event.assignment.title}
                  </Link>
                </div>
              )}
              {event.task && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="text-primary size-4" />
                  <span className="text-muted-foreground">Task:</span>
                  <Link
                    href={`/tasks/${event.task.id}`}
                    onClick={() => onOpenChange(false)}
                    className="text-primary font-medium hover:underline"
                  >
                    {event.task.title}
                  </Link>
                </div>
              )}
              {event.user && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">Participant:</span>
                  <span className="font-medium">{event.user.name}</span>
                </div>
              )}
            </div>
          )}

          {isAutoEvent && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              This event is automatically synchronized with its parent
              assignment/task. To change or remove it, please edit the source
              record directly.
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {canManage && !isAutoEvent && (
            <Button
              type="button"
              variant="destructive"
              className="gap-1.5"
              disabled={deleteEvent.isPending}
              onClick={handleDelete}
            >
              {deleteEvent.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete Event
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
