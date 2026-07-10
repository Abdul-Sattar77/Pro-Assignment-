"use client";

import { Trash2, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "../types";

const priorityColors = {
  low: "bg-green-500/15 text-green-600 border-green-500/30",
  medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  high: "bg-red-500/15 text-red-600 border-red-500/30",
};

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  todo: "doing",
  doing: "done",
  done: null,
};

const nextLabel: Record<TaskStatus, string> = {
  todo: "Start",
  doing: "Complete",
  done: "Done",
};

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdateStatus, onDelete }: TaskCardProps) {
  const next = nextStatus[task.status];

  return (
    <Card className="group">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug font-medium",
              task.status === "done" && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive size-7 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {task.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs capitalize",
                priorityColors[task.priority],
              )}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="size-3" />
                {task.dueDate}
              </span>
            )}
          </div>

          {next && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onUpdateStatus(task.id, next)}
            >
              {nextLabel[task.status]}
              <ArrowRight className="size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
