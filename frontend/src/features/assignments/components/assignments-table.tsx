"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { ChevronLeft, ChevronRight, Search, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { PRIORITY_META, STATUS_FILTER_OPTIONS } from "../constants";
import { useAssignments } from "../hooks/use-assignments";
import type { Assignment, AssignmentStatus } from "../types";
import { StatusBadge } from "./status-badge";

const ALL = "all";

/** Deadline cell — highlights overdue, due today, and days remaining. */
function DeadlineCell({ assignment }: { assignment: Assignment }) {
  const date = new Date(assignment.deadline);
  const now = new Date();
  const isTerminal = ["completed", "cancelled"].includes(assignment.status);

  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let indicatorBadge = null;
  if (!isTerminal) {
    if (diffMs < 0) {
      indicatorBadge = (
        <span className="ml-2 inline-flex items-center rounded-md bg-red-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
          Overdue
        </span>
      );
    } else if (diffDays <= 1) {
      indicatorBadge = (
        <span className="ml-2 inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Due today
        </span>
      );
    }
  }

  return (
    <div className="text-sm">
      <span className="font-mono text-xs">{format(date, "MMM d, yyyy")}</span>
      {indicatorBadge}
    </div>
  );
}

/**
 * The orders queue (PM/admin see all orders; the API scopes what writers and
 * clients receive). Row click → detail page where the action bar lives.
 */
export function AssignmentsTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isError, refetch } = useAssignments({
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as AssignmentStatus),
    page,
    perPage: 10,
  });

  const pagination = data?.pagination;

  const handleExportSelected = () => {
    if (selectedIds.length === 0) return;
    const jsonStr = JSON.stringify(selectedIds, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected-assignments-${Date.now()}.json`;
    a.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-56 sm:flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title or subject…"
            className="pl-9"
            aria-label="Search assignments"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-56"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-mono font-semibold">
              {selectedIds.length} selected
            </span>
            <span>Bulk Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="mr-1.5 size-3.5" /> Export Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              <X className="mr-1 size-3.5" /> Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 px-3"></TableHead>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Subject</TableHead>
              <TableHead className="whitespace-nowrap">Client</TableHead>
              <TableHead className="whitespace-nowrap">Project Manager</TableHead>
              <TableHead className="whitespace-nowrap">Writer</TableHead>
              <TableHead className="whitespace-nowrap">Priority</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Deadline</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 11 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center">
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
                <TableCell colSpan={11} className="py-12 text-center">
                  <p className="text-sm font-medium">No assignments found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    New student assignments appear here the moment they are
                    submitted.
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
                <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(assignment.id)}
                    onCheckedChange={() => toggleSelect(assignment.id)}
                    aria-label={`Select ${assignment.title}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  #{assignment.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {assignment.title}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {assignment.subject}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {assignment.client?.name ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {assignment.projectManager?.name ? (
                    <span className="font-medium">{assignment.projectManager.name}</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {assignment.writer?.name ? (
                    <span className="font-medium">{assignment.writer.name}</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={cn(PRIORITY_META[assignment.priority]?.className ?? "")}
                  >
                    {assignment.priorityLabel}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge assignment={assignment} status={assignment.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <DeadlineCell assignment={assignment} />
                </TableCell>
                <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/assignments/${assignment.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} assignments
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
    </div>
  );
}
