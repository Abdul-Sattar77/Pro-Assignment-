"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/features/auth";
import {
  SORT_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "../constants";
import { useTasks, useDeleteTask } from "../hooks/use-tasks";
import type { TaskFilters, TaskStatus, TaskPriority, Task } from "../types";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";

const ALL = "all";

function DueDateCell({ task }: { task: Task }) {
  if (!task.dueDate)
    return <span className="text-muted-foreground text-xs">—</span>;

  const date = new Date(task.dueDate);
  const overdue =
    isPast(date) && task.status !== "completed" && task.status !== "cancelled";

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        overdue ? "text-destructive font-medium" : "text-muted-foreground",
      )}
    >
      {format(date, "MMM d, yyyy")}
      {overdue && <span className="ml-1 font-semibold">· overdue</span>}
    </span>
  );
}

export function TasksTable() {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const deleteTask = useDeleteTask();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("tasks.manage");

  const debouncedSearch = useDebouncedValue(search);

  const filters: TaskFilters = {
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as TaskStatus),
    priority: priority === ALL ? undefined : (priority as TaskPriority),
    sort,
    page,
    perPage: 15,
  };

  const { data, isPending, isError, refetch } = useTasks(filters);
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setStatus(ALL);
    setPriority(ALL);
    setSearch("");
    setPage(1);
  };

  const handleDelete = (task: Task) => {
    if (
      window.confirm(
        `Are you sure you want to delete task: "${task.title}"? This action cannot be undone.`,
      )
    ) {
      deleteTask.mutate(task.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar row 1: search + sort + filter toggle + add task */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Search tasks by title or details..."
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v);
            resetPage();
          }}
        >
          <SelectTrigger className="w-48" aria-label="Sort tasks">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>

        {canManage && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="ml-auto gap-2 lg:ml-0"
          >
            <Plus className="size-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Toolbar row 2: filter dropdowns (collapsible) */}
      {showFilters && (
        <div className="bg-card text-card-foreground flex flex-wrap items-center gap-3 rounded-lg border p-3">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-48" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={priority}
            onValueChange={(v) => {
              setPriority(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-48" aria-label="Filter by priority">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All priorities</SelectItem>
              {PRIORITY_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(status !== ALL || priority !== ALL || search !== "") && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-52">Task</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Assigned User</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 6 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 7 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-36" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Couldn&apos;t load tasks. Please try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data && data.tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium">No tasks found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Try adjusting your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {data?.tasks.map((task) => (
              <TableRow
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <p className="max-w-64 truncate font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-muted-foreground max-w-64 truncate text-xs">
                      {task.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {task.assignment?.title ?? "—"}
                </TableCell>
                <TableCell className="text-foreground text-sm font-medium">
                  {task.assignedUser?.name ?? (
                    <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <DueDateCell task={task} />
                </TableCell>
                <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0"
                      title="View Task"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <Eye className="size-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0"
                          title="Edit Task"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive size-8 p-0"
                          title="Delete Task"
                          onClick={() => handleDelete(task)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {canManage && (
        <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}

      {canManage && editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={Boolean(editingTask)}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
