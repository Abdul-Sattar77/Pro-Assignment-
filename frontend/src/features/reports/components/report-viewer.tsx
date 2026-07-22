"use client";

import { useState } from "react";
import { useReport, useExportReport } from "../hooks/use-reports";
import { REPORT_OPTIONS, REPORT_META } from "../constants";
import { REPORT_TYPE, type ReportType } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Loader2, Download, Printer, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export function ReportViewer() {
  const [type, setType] = useState<ReportType>(REPORT_TYPE.ASSIGNMENTS);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters = {
    type,
    from: from || undefined,
    to: to || undefined,
  };

  const { data, isLoading, error } = useReport(filters);
  const exportReport = useExportReport();

  const handleExport = () => {
    exportReport.mutate(filters);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format currency or numbers dynamically in tables
  const formatCell = (val: any, header: string) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "boolean") return val ? "Yes" : "No";

    const headerLower = header.toLowerCase();
    if (
      (headerLower.includes("pkr") ||
        headerLower.includes("price") ||
        headerLower.includes("cost") ||
        headerLower.includes("earnings") ||
        headerLower.includes("paid") ||
        headerLower.includes("profit") ||
        headerLower.includes("discount") ||
        headerLower.includes("revenue") ||
        headerLower.includes("inflow") ||
        headerLower.includes("outflow")) &&
      typeof val === "number"
    ) {
      return `PKR ${val.toLocaleString()}`;
    }

    if (
      headerLower.includes("date") ||
      headerLower.includes("at") ||
      headerLower.includes("deadline")
    ) {
      try {
        return format(new Date(val), "MMM dd, yyyy HH:mm");
      } catch (e) {
        return String(val);
      }
    }

    if (
      (headerLower.includes("rate") || headerLower.includes("margin")) &&
      typeof val === "number"
    ) {
      return `${val}%`;
    }

    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Print styles wrapper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Filters Box */}
      <Card className="no-print bg-card/50 border">
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label
                htmlFor="report-type-select"
                className="text-muted-foreground text-xs font-medium"
              >
                Report Type
              </label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as ReportType)}
              >
                <SelectTrigger id="report-type-select" className="w-[240px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="date-from"
                className="text-muted-foreground text-xs font-medium"
              >
                From Date
              </label>
              <Input
                id="date-from"
                type="date"
                className="w-[180px]"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="date-to"
                className="text-muted-foreground text-xs font-medium"
              >
                To Date
              </label>
              <Input
                id="date-to"
                type="date"
                className="w-[180px]"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handlePrint}
                disabled={isLoading || !data}
              >
                <Printer className="h-4 w-4" />
                Print / PDF
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExport}
                disabled={isLoading || !data || exportReport.isPending}
              >
                {exportReport.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export CSV
              </Button>

              <Button
                className="gap-2"
                onClick={() => {
                  if (!data) return;
                  const keys = Object.keys(data.rows[0] || {});
                  const csvRows = [
                    keys.join("\t"),
                    ...data.rows.map((row: any) =>
                      keys.map((k) => `"${row[k] ?? ""}"`).join("\t")
                    ),
                  ].join("\n");
                  const blob = new Blob([csvRows], {
                    type: "application/vnd.ms-excel;charset=utf-8",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${type}-report-${Date.now()}.xls`;
                  a.click();
                }}
                disabled={isLoading || !data}
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Report Area */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">
            Aggregating report data...
          </span>
        </div>
      ) : error || !data ? (
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-6 text-center">
          <h3 className="text-lg font-semibold">Failed to load report</h3>
          <p className="mt-1 text-sm opacity-90">
            {error?.message || "Verify your roles and backend connection."}
          </p>
        </div>
      ) : (
        <div id="print-area" className="bg-background space-y-6 p-1 print:p-6">
          {/* Header (visible in print too) */}
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {REPORT_META[type].label}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {REPORT_META[type].description}
            </p>
            {(from || to) && (
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Date Range:{" "}
                  {from ? format(new Date(from), "MMM dd, yyyy") : "Beginning"}{" "}
                  - {to ? format(new Date(to), "MMM dd, yyyy") : "Present"}
                </span>
              </div>
            )}
          </div>

          {/* Metric Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.metrics.map((metric, i) => (
              <Card key={i} className="border shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold tracking-tight">
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Data Table */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Report Detail Rows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {data.headers.map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={data.headers.length}
                          className="text-muted-foreground h-24 text-center"
                        >
                          No records match parameter criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.rows.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          {Object.values(row).map((val, cellIdx) => (
                            <TableCell
                              key={cellIdx}
                              className="max-w-xs truncate text-xs"
                            >
                              {formatCell(val, data.headers[cellIdx])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
