import { format } from "date-fns";
import type { AssignmentEvent } from "../types";

/**
 * Vertical activity timeline (newest first — as the API returns them).
 * Every workflow action lands here automatically via assignment_events.
 */
export function AssignmentTimeline({ events }: { events: AssignmentEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            aria-hidden
            className="border-background bg-primary absolute top-1.5 -left-[1.85rem] size-3 rounded-full border-2"
          />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-muted-foreground text-xs">
              {event.actor?.name ?? "System"}
              {event.createdAt &&
                ` · ${format(new Date(event.createdAt), "MMM d, HH:mm")}`}
            </p>
          </div>
          {event.note && (
            <p className="text-muted-foreground bg-secondary/60 mt-1.5 rounded-md px-3 py-2 text-sm">
              “{event.note}”
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
