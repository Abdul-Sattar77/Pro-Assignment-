"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { useTasks } from "../hooks/use-tasks";
import type { TaskStatus } from "../types";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "To Do", color: "text-muted-foreground" },
  { status: "doing", label: "In Progress", color: "text-amber-500" },
  { status: "done", label: "Done", color: "text-green-500" },
];

export function TaskBoard() {
  const { addTask, updateStatus, deleteTask, getByStatus } = useTasks();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map(({ status, label, color }) => {
        const tasks = getByStatus(status);
        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className={cn("text-sm font-semibold", color)}>{label}</h2>
              <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-xs">
                {tasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteTask}
                />
              ))}
            </div>

            {status === "todo" && <TaskForm onAdd={addTask} />}
          </div>
        );
      })}
    </div>
  );
}
