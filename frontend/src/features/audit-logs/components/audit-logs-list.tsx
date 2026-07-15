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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
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
        <div className="bg-card rounded-md border md:col-span-2">
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
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground text-sm">
                        Loading activity logs...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    No activity registered in audit records.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`hover:bg-muted/30 cursor-pointer ${
                      selectedLogId === log.id ? "bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 font-mono text-[10px] capitalize"
                      >
                        {log.logName.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {log.causer?.name || "System Autorun"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Eye className="text-muted-foreground h-3.5 w-3.5" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
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
              if (!active)
                return (
                  <Card className="text-muted-foreground p-6 text-center text-sm">
                    Select a log to inspect details.
                  </Card>
                );
              return (
                <Card className="flex h-full flex-col justify-between border">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                      Change Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[500px] flex-1 space-y-4 overflow-y-auto py-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 capitalize dark:text-slate-200">
                        {active.logName.replace("_", " ")} Audit Log #
                        {active.id}
                      </h4>
                      <p className="dark:text-slate-350 text-xs text-slate-600">
                        {active.description}
                      </p>
                    </div>

                    <div className="text-muted-foreground space-y-1 border-t pt-2 text-xs">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>
                          Timestamp:{" "}
                          {format(
                            new Date(active.createdAt),
                            "yyyy-MM-dd HH:mm:ss",
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>
                          Responsible: {active.causer?.name || "System"} (
                          {active.causer?.email || "none"})
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Layers className="size-3.5" />
                        <span>Linked ID: #{active.subjectId}</span>
                      </p>
                    </div>

                    {active.properties &&
                      Object.keys(active.properties).length > 0 && (
                        <div className="space-y-1.5 border-t pt-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Detailed Changed Fields
                          </p>
                          <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-[10px] whitespace-pre-wrap text-slate-100 dark:bg-slate-950 dark:text-slate-300">
                            {JSON.stringify(active.properties, null, 2)}
                          </pre>
                        </div>
                      )}
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card className="text-muted-foreground flex h-64 flex-col items-center justify-center border border-dashed p-8 text-center text-sm">
              <Layers className="text-muted-foreground/60 mb-2 size-8" />
              Select any activity log row to view old vs new change details.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
