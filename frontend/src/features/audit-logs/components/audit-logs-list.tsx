"use client";

import { useState } from "react";
import { useAuditLogs } from "../hooks/use-audit-logs";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Search, Calendar, User, Eye, Layers } from "lucide-react";
import { format } from "date-fns";

export function AuditLogsList() {
  const [search, setSearch] = useState("");
  const [logName, setLogName] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const filters = {
    logName: logName === "all" ? undefined : logName,
    search: search || undefined,
    page,
    perPage: 25,
  };

  const { data, isLoading } = useAuditLogs(filters);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search descriptions or modules..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={logName}
            onValueChange={(val) => {
              setLogName(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Log Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="complaint">Complaints</SelectItem>
              <SelectItem value="document_template">Templates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main List */}
        <div className="md:col-span-2 rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action Logged</TableHead>
                <TableHead>User Responsible</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground text-sm">Loading activity logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No activity registered in audit records.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`cursor-pointer hover:bg-muted/30 ${
                      selectedLogId === log.id ? "bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px] py-0 px-1.5 font-mono">
                        {log.logName.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.causer?.name || "System Autorun"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-muted-foreground text-xs">
                Showing Page {pagination.page} of {pagination.totalPages}
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
          {selectedLogId ? (
            (() => {
              const active = logs.find((l) => l.id === selectedLogId);
              if (!active) return <Card className="p-6 text-center text-muted-foreground text-sm">Select a log to inspect details.</Card>;
              return (
                <Card className="border flex flex-col h-full justify-between">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Change Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 py-4 flex-1 overflow-y-auto max-h-[500px]">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize">
                        {active.logName.replace("_", " ")} Audit Log #{active.id}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-350">{active.description}</p>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>Timestamp: {format(new Date(active.createdAt), "yyyy-MM-dd HH:mm:ss")}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>Responsible: {active.causer?.name || "System"} ({active.causer?.email || "none"})</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Layers className="size-3.5" />
                        <span>Linked ID: #{active.subjectId}</span>
                      </p>
                    </div>

                    {active.properties && Object.keys(active.properties).length > 0 && (
                      <div className="space-y-1.5 border-t pt-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Detailed Changed Fields</p>
                        <pre className="text-[10px] font-mono p-3 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-300 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(active.properties, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 border border-dashed text-muted-foreground text-sm h-64 text-center">
              <Layers className="size-8 text-muted-foreground/60 mb-2" />
              Select any activity log row to view old vs new change details.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
