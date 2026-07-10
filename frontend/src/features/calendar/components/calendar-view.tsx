"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../types";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Assignment #A-101 deadline",
    date: "2026-07-12",
    type: "deadline",
    priority: "high",
  },
  {
    id: "2",
    title: "Review #A-102",
    date: "2026-07-11",
    type: "assignment",
    priority: "high",
  },
  {
    id: "3",
    title: "Send weekly update",
    date: "2026-07-10",
    type: "task",
    priority: "medium",
  },
  {
    id: "4",
    title: "Assignment #A-103 deadline",
    date: "2026-07-15",
    type: "deadline",
    priority: "medium",
  },
  {
    id: "5",
    title: "Client meeting",
    date: "2026-07-18",
    type: "task",
    priority: "low",
  },
  {
    id: "6",
    title: "Assignment #A-104 deadline",
    date: "2026-07-22",
    type: "deadline",
    priority: "high",
  },
  {
    id: "7",
    title: "Writer performance review",
    date: "2026-07-25",
    type: "task",
    priority: "medium",
  },
];

const EVENT_STYLES = {
  assignment: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  task: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  deadline: "bg-red-500/20 text-red-400 border-red-500/30",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView() {
  const today = new Date();
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getEvents(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return MOCK_EVENTS.filter((e) => e.date === dateStr);
  }

  const selectedDateStr = selected;
  const selectedEvents = selectedDateStr
    ? MOCK_EVENTS.filter((e) => e.date === selectedDateStr)
    : [];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {
              MOCK_EVENTS.filter((e) =>
                e.date.startsWith(
                  `${year}-${String(month + 1).padStart(2, "0")}`,
                ),
              ).length
            }{" "}
            events this month
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() =>
              setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border">
        {/* Day headers */}
        <div className="bg-muted/30 grid grid-cols-7 border-b">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-muted-foreground py-3 text-center text-xs font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`empty-${i}`}
                  className="bg-muted/10 min-h-24 border-r border-b last:border-r-0"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = getEvents(day);
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const isSelected = selected === dateStr;
            const isWeekend = i % 7 === 0 || i % 7 === 6;

            return (
              <div
                key={day}
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={cn(
                  "min-h-24 cursor-pointer border-r border-b p-2 transition-colors last:border-r-0",
                  isWeekend && "bg-muted/20",
                  isSelected &&
                    "bg-primary/10 ring-primary/30 ring-1 ring-inset",
                  !isSelected && "hover:bg-muted/40",
                  (i + 1) % 7 === 0 && "border-r-0",
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday && "bg-primary text-primary-foreground",
                      !isToday && "text-foreground",
                    )}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="bg-primary size-1.5 rounded-full" />
                  )}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                        EVENT_STYLES[e.type],
                      )}
                    >
                      {e.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <p className="text-muted-foreground px-1 text-[10px]">
                      +{events.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-semibold">{selected}</p>
          {selectedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No events on this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-muted/40 flex items-center gap-3 rounded-lg p-2"
                >
                  <Clock className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="flex-1 text-sm">{e.title}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", EVENT_STYLES[e.type])}
                  >
                    {e.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="text-muted-foreground flex gap-4 pt-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-400" /> Assignment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-400" /> Deadline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" /> Task
        </span>
      </div>
    </div>
  );
}
