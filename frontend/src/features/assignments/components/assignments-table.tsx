"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Plus } from "lucide-react";
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
import {
  PRIORITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "../constants";
import { useAssignments } from "../hooks/use-assignments";
import type { AdminAssignmentFilters, Assignment, AssignmentPriority, AssignmentStatus } from "../types";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { useAuth } from "@/features/auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateAssignmentDialog } from "./create-assignment-dialog";

const ALL = "all";

/** Deadline cell — highlights overdue, non-terminal orders. */
function DeadlineCell({ assignment }: { assignment: Assignment }) {
  const date = new Date(assignment.deadline);
  const overdue =
    isPast(date) && !["completed", "cancelled"].includes(assignment.status);

  return (
    <span
      className={cn(
        "tabular-nums text-xs",
        overdue ? "text-destructive font-medium" : "text-muted-foreground",
      )}
    >
      {format(date, "MMM d, yyyy")}
      {overdue && <span className="ml-1 font-semibold">· overdue</span>}
    </span>
  );
}

/**
 * The orders queue — full admin view.
 * PM/admin see all orders; the API scopes what writers and clients receive.
 * Row click → detail page where the action bar lives.
 */
export function AssignmentsTable() {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [writerId, setWriterId] = useState(ALL);
  const [projectManagerId, setProjectManagerId] = useState(ALL);
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { user, hasPermission } = useAuth();
  const isStaff = user?.roles.includes("admin") || user?.roles.includes("project_manager");
  const isAdmin = user?.roles.includes("admin");
  const canCreate = hasPermission("assignments.create");

  const { data: writers } = useQuery({
    queryKey: ["users", "list", { role: "writer", status: "active" }],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; name: string }[] }>("/users", {
        params: { "filter[role]": "writer", "filter[status]": "active", per_page: 100 },
      });
      return data.data;
    },
    enabled: Boolean(isStaff && showFilters),
    staleTime: 30 * 1000,
  });

  const { data: managers } = useQuery({
    queryKey: ["users", "list", { role: "project_manager", status: "active" }],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; name: string }[] }>("/users", {
        params: { "filter[role]": "project_manager", "filter[status]": "active", per_page: 100 },
      });
      return data.data;
    },
    enabled: Boolean(isAdmin && showFilters),
    staleTime: 30 * 1000,
  });

  const debouncedSearch = useDebouncedValue(search);

  const filters: AdminAssignmentFilters = {
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as AssignmentStatus),
    priority: priority === ALL ? undefined : (priority as AssignmentPriority),
    writerId: writerId === ALL ? undefined : writerId,
    projectManagerId: projectManagerId === ALL ? undefined : projectManagerId,
    deadlineFrom: deadlineFrom || undefined,
    deadlineTo: deadlineTo || undefined,
    sort,
    page,
    perPage: 15,
  };

  const { data, isPending, isError, refetch } = useAssignments(filters);
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setStatus(ALL);
    setPriority(ALL);
    setWriterId(ALL);
    setProjectManagerId(ALL);
    setDeadlineFrom("");
    setDeadlineTo("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar row 1: search + sort + filter toggle + place order */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search by title or subject…"
            className="pl-9"
            aria-label="Search assignments"
          />
        </div>

        <Select
          value={sort}
          onValueChange={(v) => { setSort(v); resetPage(); }}
        >
          <SelectTrigger className="w-48" aria-label="Sort orders">
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

        {canCreate && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2 ml-auto lg:ml-0">
            <Plus className="size-4" />
            Place Order
          </Button>
        )}
      </div>

      {/* Toolbar row 2: filter dropdowns (collapsible) */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 bg-card text-card-foreground">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) => { setStatus(v); resetPage(); }}
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
            onValueChange={(v) => { setPriority(v); resetPage(); }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by priority">
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

          {/* Writer Filter (Staff only) */}
          {isStaff && (
            <Select
              value={writerId}
              onValueChange={(v) => { setWriterId(v); resetPage(); }}
            >
              <SelectTrigger className="w-48" aria-label="Filter by writer">
                <SelectValue placeholder="All writers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All writers</SelectItem>
                {writers?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* PM Filter (Admin only) */}
          {isAdmin && (
            <Select
              value={projectManagerId}
              onValueChange={(v) => { setProjectManagerId(v); resetPage(); }}
            >
              <SelectTrigger className="w-48" aria-label="Filter by manager">
                <SelectValue placeholder="All managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All managers</SelectItem>
                {managers?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Deadline range */}
          <div className="flex items-center gap-2 border rounded-md px-2.5 py-1.5 h-10 text-sm bg-background">
            <span className="text-muted-foreground text-xs font-medium">Deadline:</span>
            <input
              type="date"
              value={deadlineFrom}
              onChange={(e) => { setDeadlineFrom(e.target.value); resetPage(); }}
              className="bg-transparent border-none outline-none text-xs w-28 text-foreground"
              aria-label="Deadline from"
            />
            <span className="text-muted-foreground text-xs font-medium">—</span>
            <input
              type="date"
              value={deadlineTo}
              onChange={(e) => { setDeadlineTo(e.target.value); resetPage(); }}
              className="bg-transparent border-none outline-none text-xs w-28 text-foreground"
              aria-label="Deadline to"
            />
          </div>

          {/* Clear filters */}
          {(status !== ALL || priority !== ALL || writerId !== ALL || projectManagerId !== ALL || deadlineFrom !== "" || deadlineTo !== "" || search !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
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
              <TableHead className="min-w-52">Order</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Writer</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
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
                    Couldn&apos;t load orders. Please try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data && data.assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium">No orders found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Try adjusting your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {data?.assignments.map((assignment) => (
              <TableRow
                key={assignment.id}
                onClick={() => router.push(`/assignments/${assignment.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <p className="max-w-52 truncate font-medium">
                    {assignment.title}
                  </p>
                  <p className="text-muted-foreground max-w-52 truncate text-xs">
                    {assignment.subject}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {assignment.client?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {assignment.writer?.name ?? (
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {assignment.projectManager?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {assignment.priority ? (
                    <PriorityBadge priority={assignment.priority} />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={assignment.status} />
                </TableCell>
                <TableCell>
                  <DeadlineCell assignment={assignment} />
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
            {pagination.total} orders
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

      {canCreate && (
        <CreateAssignmentDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
