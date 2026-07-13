"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import {
  Search,
  UserPlus,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_FILTER_OPTIONS } from "../constants";
import type { AssignmentStatus } from "../types";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS = [
  {
    id: "1",
    title: "Essay Writing — Climate Change",
    subject: "Environmental Science",
    status: "pending_assignment",
    priority: "high",
    client: { name: "John Smith" },
    writer: null,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "2",
    title: "Research Paper — Quantum Computing",
    subject: "Computer Science",
    status: "in_progress",
    priority: "urgent",
    client: { name: "Sarah Johnson" },
    writer: { name: "Sara Writer" },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "3",
    title: "Case Study — Tesla Business Strategy",
    subject: "Business Management",
    status: "submitted",
    priority: "medium",
    client: { name: "Mike Davis" },
    writer: { name: "Ahmed Writer" },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "4",
    title: "Thesis Chapter — Literature Review",
    subject: "Healthcare & ML",
    status: "revision_requested",
    priority: "high",
    client: { name: "Emma Wilson" },
    writer: { name: "Sara Writer" },
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    title: "Marketing Plan — Product Launch",
    subject: "Marketing",
    status: "completed",
    priority: "low",
    client: { name: "David Brown" },
    writer: { name: "Ahmed Writer" },
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "6",
    title: "Dissertation — AI in Finance",
    subject: "Finance & Technology",
    status: "under_review",
    priority: "urgent",
    client: { name: "Lisa Chen" },
    writer: { name: "Sara Writer" },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
];

const STATUS_STYLES: Record<string, string> = {
  pending_assignment: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  submitted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  under_review: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  revision_requested: "bg-red-500/15 text-red-400 border-red-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending_assignment: "Pending Assignment",
  in_progress: "In Progress",
  submitted: "Submitted",
  under_review: "Under Review",
  revision_requested: "Revision Requested",
  completed: "Completed",
  cancelled: "Cancelled",
};

function DeadlineCell({
  deadline,
  status,
}: {
  deadline: string;
  status: string;
}) {
  const date = new Date(deadline);
  const overdue = isPast(date) && !["completed", "cancelled"].includes(status);
  const dueToday =
    !overdue && date.getTime() - Date.now() < 1000 * 60 * 60 * 24;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm tabular-nums",
        overdue
          ? "font-medium text-red-400"
          : dueToday
            ? "font-medium text-amber-400"
            : "text-muted-foreground",
      )}
    >
      {overdue && <AlertTriangle className="size-3" />}
      {dueToday && !overdue && <Clock className="size-3" />}
      {format(date, "MMM d, yyyy")}
      {overdue && " · overdue"}
      {dueToday && !overdue && " · today"}
    </span>
  );
}

const ALL = "all";

export function AssignmentsTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = MOCK_ASSIGNMENTS.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === ALL || a.status === status;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const stats = {
    total: MOCK_ASSIGNMENTS.length,
    pending: MOCK_ASSIGNMENTS.filter((a) => a.status === "pending_assignment")
      .length,
    inProgress: MOCK_ASSIGNMENTS.filter((a) => a.status === "in_progress")
      .length,
    overdue: MOCK_ASSIGNMENTS.filter(
      (a) =>
        isPast(new Date(a.deadline)) &&
        !["completed", "cancelled"].includes(a.status),
    ).length,
    completed: MOCK_ASSIGNMENTS.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-blue-400" },
          {
            label: "In Progress",
            value: stats.inProgress,
            color: "text-purple-400",
          },
          { label: "Overdue", value: stats.overdue, color: "text-red-400" },
          {
            label: "Completed",
            value: stats.completed,
            color: "text-green-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card rounded-xl border p-3 text-center"
          >
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or subject..."
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-medium">Order</TableHead>
              <TableHead className="font-medium">Client</TableHead>
              <TableHead className="font-medium">Writer</TableHead>
              <TableHead className="font-medium">Priority</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Deadline</TableHead>
              <TableHead className="font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <CheckCircle2 className="text-muted-foreground/30 mx-auto mb-3 size-8" />
                  <p className="text-sm font-medium">No assignments found</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Try changing the search or filter.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {paginated.map((assignment) => (
              <TableRow
                key={assignment.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/assignments/${assignment.id}`)}
              >
                <TableCell>
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {assignment.subject}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {assignment.client?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {assignment.writer ? (
                    <span className="text-muted-foreground text-sm">
                      {assignment.writer.name}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <UserPlus className="size-3" />
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      PRIORITY_STYLES[assignment.priority],
                    )}
                  >
                    {assignment.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", STATUS_STYLES[assignment.status])}
                  >
                    {STATUS_LABELS[assignment.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DeadlineCell
                    deadline={assignment.deadline}
                    status={assignment.status}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/assignments/${assignment.id}`);
                      }}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    {!assignment.writer && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-amber-400"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <UserPlus className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs tabular-nums">
            Page {page} of {totalPages} · {filtered.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
