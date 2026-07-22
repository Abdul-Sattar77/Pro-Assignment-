"use client";

import { useState } from "react";
import { useComplaints } from "../hooks/use-complaints";
import { SubmitComplaintDialog } from "./submit-complaint-dialog";
import { ResolveComplaintDialog } from "./resolve-complaint-dialog";
import { COMPLAINT_STATUS_META, COMPLAINT_SORT_OPTIONS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/features/auth";

export function ComplaintsList() {
  const { hasRole } = useAuth();
  const isClient = hasRole("client");
  const isStaff = hasRole("admin") || hasRole("project_manager");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);

  // Dialog controllers
  const [openSubmit, setOpenSubmit] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null,
  );

  const filters = {
    status: status === "all" ? undefined : status,
    search: search || undefined,
    sort,
    page,
    perPage: 15,
  };

  const { data, isLoading } = useComplaints(filters);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const triggerResolution = (id: string) => {
    setSelectedComplaintId(id);
    setOpenResolve(true);
  };

  const complaints = data?.complaints || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search complaints subject/details..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(COMPLAINT_STATUS_META).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(val) => {
              setSort(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isClient && (
          <Button onClick={() => setOpenSubmit(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            File Complaint
          </Button>
        )}
      </div>

      {/* Grid listing */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Main List */}
        <div className="bg-card rounded-md border md:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground text-sm">
                        Loading complaints...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : complaints.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    No complaints found.
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint) => (
                  <TableRow
                    key={complaint.id}
                    className={`hover:bg-muted/30 cursor-pointer ${
                      selectedComplaintId === complaint.id ? "bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedComplaintId(complaint.id)}
                  >
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(complaint.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {complaint.subject}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {complaint.client?.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          COMPLAINT_STATUS_META[complaint.status].badgeClass
                        }
                      >
                        {COMPLAINT_STATUS_META[complaint.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <div className="text-muted-foreground text-xs">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Side Card View */}
        <div className="md:col-span-1">
          {selectedComplaintId ? (
            (() => {
              const active = complaints.find(
                (c) => c.id === selectedComplaintId,
              );
              if (!active)
                return (
                  <Card className="text-muted-foreground p-6 text-center text-sm">
                    Select a complaint to view details.
                  </Card>
                );
              return (
                <Card className="flex h-full flex-col justify-between border">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                      Complaint Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 py-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {active.subject}
                      </h4>
                      <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={
                            COMPLAINT_STATUS_META[active.status].badgeClass
                          }
                        >
                          {COMPLAINT_STATUS_META[active.status].label}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {format(new Date(active.createdAt), "MMM dd, HH:mm")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/40">
                      <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                        <User className="size-3.5" />
                        Client Description
                      </p>
                      <p className="dark:text-slate-350 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                        {active.description}
                      </p>
                    </div>

                    {active.assignment && (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <FileText className="size-3.5" />
                        <span>
                          Order: <strong>{active.assignment.title}</strong>
                        </span>
                      </div>
                    )}

                    {active.projectManager && (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <User className="size-3.5" />
                        <span>
                          Assigned PM: <strong>{active.projectManager.name}</strong>
                        </span>
                      </div>
                    )}

                    {active.writer && (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <User className="size-3.5" />
                        <span>
                          Assigned Writer: <strong>{active.writer.name}</strong>
                        </span>
                      </div>
                    )}

                    {active.resolution ? (
                      <div className="space-y-1 rounded-lg border border-emerald-500/25 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                        <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          Resolution Details (by {active.resolverName})
                        </p>
                        <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-wrap">
                          {active.resolution}
                        </p>
                        {active.resolvedAt && (
                          <p className="text-muted-foreground pt-1 text-[10px]">
                            Resolved:{" "}
                            {format(
                              new Date(active.resolvedAt),
                              "MMM dd, yyyy HH:mm",
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      isStaff && (
                        <div className="mt-4 border-t pt-2">
                          <Button
                            className="w-full gap-1.5"
                            onClick={() => triggerResolution(active.id)}
                          >
                            <CheckCircle2 className="size-4" />
                            Resolve Complaint
                          </Button>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card className="text-muted-foreground flex h-64 flex-col items-center justify-center border border-dashed p-8 text-center text-sm">
              <AlertCircle className="text-muted-foreground/60 mb-2 size-8" />
              Select a complaint from the list to review description and
              resolution history.
            </Card>
          )}
        </div>
      </div>

      <SubmitComplaintDialog open={openSubmit} onOpenChange={setOpenSubmit} />

      {openResolve && selectedComplaintId && (
        <ResolveComplaintDialog
          complaintId={selectedComplaintId}
          open={openResolve}
          onOpenChange={setOpenResolve}
        />
      )}
    </div>
  );
}

// Inline fallback since AlertCircle could be imported from lucide-react in case of compiler checks.
import { AlertCircle as AlertCircleFallback } from "lucide-react";
const AlertCircle = AlertCircleFallback;
