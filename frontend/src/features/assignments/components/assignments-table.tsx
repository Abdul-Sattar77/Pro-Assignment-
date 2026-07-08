"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import { STATUS_FILTER_OPTIONS } from "../constants";
import { useAssignments } from "../hooks/use-assignments";
import type { Assignment, AssignmentStatus } from "../types";
import { StatusBadge } from "./status-badge";

const ALL = "all";

/** Deadline cell — highlights overdue, non-terminal orders. */
function DeadlineCell({ assignment }: { assignment: Assignment }) {
  const date = new Date(assignment.deadline);
  const overdue =
    isPast(date) && !["completed", "cancelled"].includes(assignment.status);

  return (
    <span
      className={cn(
        "tabular-nums",
        overdue ? "text-destructive font-medium" : "text-muted-foreground",
      )}
    >
      {format(date, "MMM d, yyyy HH:mm")}
      {overdue && " · overdue"}
    </span>
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

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isError, refetch } = useAssignments({
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as AssignmentStatus),
    page,
    perPage: 10,
  });

  const pagination = data?.pagination;

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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Writer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 5 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-44" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
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
                <TableCell colSpan={5} className="py-12 text-center">
                  <p className="text-sm font-medium">No orders found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    New client orders appear here the moment they are placed.
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
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {assignment.subject}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {assignment.client?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {assignment.writer?.name ?? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Unassigned
                    </span>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
}
