"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useCalendarEvents } from "../hooks/use-calendar";
import { EVENT_TYPE_META, TYPE_FILTER_OPTIONS } from "../constants";
import type { CalendarFilters, CalendarEventType, CalendarEvent } from "../types";
import { EventDetailDialog } from "./event-detail-dialog";
import { CreateEventDialog } from "./create-event-dialog";

const ALL = "all";

export function CalendarView() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState<string>(ALL);

  // Modal open states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  const { hasPermission } = useAuth();
  const canManage = hasPermission("calendar.manage");

  // Format month to fetch e.g. "2026-07"
  const monthQueryStr = format(currentMonth, "yyyy-MM");

  const filters: CalendarFilters = {
    month: monthQueryStr,
    eventType: eventTypeFilter === ALL ? undefined : (eventTypeFilter as CalendarEventType),
  };

  const { data: events, isPending } = useCalendarEvents(filters);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    if (!canManage) return;
    setSelectedDateStr(format(day, "yyyy-MM-dd"));
    setCreateOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation(); // Prevent trigger day click
    if (event.assignment?.id) {
      router.push(`/assignments/${event.assignment.id}`);
    } else {
      setSelectedEvent(event);
      setDetailOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card text-card-foreground border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Calendar className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-muted-foreground text-xs">
              Centralized view of project actions & dates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <Select
            value={eventTypeFilter}
            onValueChange={(v) => setEventTypeFilter(v)}
          >
            <SelectTrigger className="w-48 h-9" aria-label="Filter events by type">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Event Types</SelectItem>
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nav Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-9" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="size-9" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {canManage && (
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => {
                setSelectedDateStr(format(new Date(), "yyyy-MM-dd"));
                setCreateOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Grid Calendar Layout */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        {/* Days of week headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40 text-muted-foreground text-center font-semibold text-xs py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 bg-muted/15 dark:bg-muted/5 divide-x divide-y divide-border -mt-px -ml-px">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDay = isToday(day);

            // Find all events occurring on this date
            const dayEvents = events?.filter((ev) => ev.startDate.substring(0, 10) === format(day, "yyyy-MM-dd")) || [];

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[110px] p-2 flex flex-col justify-between transition-colors relative group border-t border-l",
                  isCurrentMonth ? "bg-card text-foreground" : "bg-muted/10 text-muted-foreground/50 dark:bg-zinc-950/20",
                  canManage && "cursor-pointer hover:bg-muted/20 dark:hover:bg-zinc-900/30"
                )}
              >
                {/* Day label */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums size-6 flex items-center justify-center rounded-full",
                      isTodayDay
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full md:hidden">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Day events blocks */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[74px] no-scrollbar">
                  {dayEvents.slice(0, 3).map((event) => {
                    const meta = EVENT_TYPE_META[event.eventType];
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(e, event)}
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-1 rounded border truncate hover:brightness-95 dark:hover:brightness-110 active:scale-98 transition-all flex items-center gap-1",
                          meta?.bgClass,
                          meta?.textClass,
                          meta?.borderClass
                        )}
                        title={event.title}
                      >
                        <span className={cn("size-1.5 shrink-0 rounded-full", meta?.dotClass)} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-muted-foreground font-semibold pl-1">
                      + {dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & creation modals */}
      {detailOpen && (
        <EventDetailDialog
          event={selectedEvent}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      {createOpen && canManage && (
        <CreateEventDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultDate={selectedDateStr}
        />
      )}
    </div>
  );
}
