"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
import { useAuth } from "@/features/auth";
import {
  SORT_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "../constants";
import { useLeads } from "../hooks/use-leads";
import type { LeadFilters, LeadStatus, LeadSource } from "../types";
import { StatusBadge } from "./status-badge";
import { SourceBadge } from "./source-badge";
import { CreateLeadDialog } from "./create-lead-dialog";

const ALL = "all";

export function LeadsTable() {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { hasPermission } = useAuth();
  const canManage = hasPermission("leads.manage");

  const debouncedSearch = useDebouncedValue(search);

  const filters: LeadFilters = {
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as LeadStatus),
    source: source === ALL ? undefined : (source as LeadSource),
    sort,
    page,
    perPage: 15,
  };

  const { data, isPending, isError, refetch } = useLeads(filters);
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setStatus(ALL);
    setSource(ALL);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar row 1: search + sort + filter toggle + add lead */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Search leads by name, email, or phone..."
            className="pl-9"
            aria-label="Search leads"
          />
        </div>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v);
            resetPage();
          }}
        >
          <SelectTrigger className="w-48" aria-label="Sort leads">
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
          <Button onClick={() => setCreateOpen(true)} className="gap-2 ml-auto lg:ml-0">
            <Plus className="size-4" />
            Add Lead
          </Button>
        )}
      </div>

      {/* Toolbar row 2: filter dropdowns (collapsible) */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 bg-card text-card-foreground">
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

          {/* Source */}
          <Select
            value={source}
            onValueChange={(v) => {
              setSource(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-48" aria-label="Filter by source">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All sources</SelectItem>
              {SOURCE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(status !== ALL || source !== ALL || search !== "") && (
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
              <TableHead className="min-w-52">Lead</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 6 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 6 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-36" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Couldn&apos;t load leads. Please try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data && data.leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium">No leads found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Try adjusting your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {data?.leads.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <p className="max-w-52 truncate font-medium">{lead.name}</p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {lead.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {lead.phone ?? "—"}
                </TableCell>
                <TableCell>
                  <SourceBadge source={lead.source} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs tabular-nums">
                  {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} leads
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
        <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
