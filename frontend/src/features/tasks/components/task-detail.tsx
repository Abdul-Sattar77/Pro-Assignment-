"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";
import {
  useTask,
  useDeleteTask,
  useAssignTask,
  useCompleteTask,
  useCancelTask,
} from "../hooks/use-tasks";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { EditTaskDialog } from "./edit-task-dialog";
import { TASK_STATUS } from "../types";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isPending, isError, refetch } = useTask(id);
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask(id);
  const completeTask = useCompleteTask(id);
  const cancelTask = useCancelTask(id);

  const [editOpen, setEditOpen] = useState(false);
  const { hasPermission } = useAuth();
  const canManage = hasPermission("tasks.manage");

  // Fetch active users for assignee list
  const { data: users } = useQuery({
    queryKey: ["users", "active-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: { id: string; name: string }[];
      }>("/users", {
        params: { "filter[status]": "active", per_page: 100 },
      });
      return data.data;
    },
    enabled: Boolean(task && canManage),
    staleTime: 30 * 1000,
  });

  const handleDelete = () => {
    if (!task) return;
    if (
      window.confirm(
        `Are you sure you want to delete task: "${task.title}"? This action cannot be undone.`,
      )
    ) {
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          router.push(ROUTES.tasks);
        },
      });
    }
  };

  const handleAssignChange = (userId: string) => {
    const val = userId === "none" ? null : userId;
    assignTask.mutate(val);
  };

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-24 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading task details…
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-medium">Couldn&apos;t load this task.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const isCancelled = task.status === TASK_STATUS.CANCELLED;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
            <Link href={ROUTES.tasks}>
              <ArrowLeft className="size-4" />
              All tasks
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                disabled={completeTask.isPending}
                onClick={() => completeTask.mutate()}
              >
                {completeTask.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Complete
              </Button>
            )}

            {!isCancelled && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-rose-500 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/20"
                disabled={cancelTask.isPending}
                onClick={() => cancelTask.mutate()}
              >
                {cancelTask.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Cancel
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="size-4" />
              Edit details
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled={deleteTask.isPending}
              onClick={handleDelete}
            >
              {deleteTask.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete task
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-1 font-mono text-[10px] tracking-[0.18em] uppercase">
                Description
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Meta
                label="Linked Assignment"
                value={
                  task.assignment ? (
                    <Link
                      href={`/assignments/${task.assignment.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {task.assignment.title}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <Meta
                label="Assigned User"
                value={
                  canManage ? (
                    <div className="mt-1 w-48">
                      <Select
                        onValueChange={handleAssignChange}
                        value={task.assignedUser?.id || "none"}
                        disabled={assignTask.isPending}
                      >
                        <SelectTrigger className="h-8 py-0">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {users?.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    (task.assignedUser?.name ?? "Unassigned")
                  )
                }
              />
              <Meta label="Created By" value={task.creator?.name ?? "—"} />
              <Meta
                label="Priority"
                value={<PriorityBadge priority={task.priority} />}
              />
              <Meta
                label="Status"
                value={<StatusBadge status={task.status} />}
              />
              <Meta
                label="Due Date"
                value={
                  task.dueDate ? (
                    <span className="tabular-nums">
                      {format(new Date(task.dueDate), "MMM d, yyyy HH:mm")}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              {task.completedAt && (
                <Meta
                  label="Completed At"
                  value={
                    <span className="text-emerald-600 tabular-nums dark:text-emerald-400">
                      {format(new Date(task.completedAt), "MMM d, yyyy HH:mm")}
                    </span>
                  }
                />
              )}
            </div>

            {task.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1 font-mono text-[10px] tracking-[0.18em] uppercase">
                    Internal Notes
                  </p>
                  <p className="text-muted-foreground bg-muted/30 rounded-lg border p-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {task.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Task ID (UUID)</p>
              <p className="mt-0.5 font-mono text-xs break-all select-all">
                {task.id}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Created At</p>
              <p className="mt-0.5 text-xs">
                {task.createdAt
                  ? format(new Date(task.createdAt), "MMM d, yyyy HH:mm")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Last Updated</p>
              <p className="mt-0.5 text-xs">
                {task.updatedAt
                  ? format(new Date(task.updatedAt), "MMM d, yyyy HH:mm")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {canManage && editOpen && (
        <EditTaskDialog
          task={task}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
