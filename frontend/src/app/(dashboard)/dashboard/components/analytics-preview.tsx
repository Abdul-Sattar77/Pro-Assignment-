"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Star, TrendingUp, Loader2 } from "lucide-react";
import { useDashboardStats } from "@/features/dashboard";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PERFORMANCE_REPORTS = [
  {
    title: "Assignments Activity Consolidated Audit",
    type: "assignments",
    size: "2.4 MB",
  },
  {
    title: "Clients Transaction Performance Audit",
    type: "clients",
    size: "2.1 MB",
  },
  {
    title: "Writers Delivery Performance Audit",
    type: "writers",
    size: "1.9 MB",
  },
  {
    title: "Financial Revenue Audits Registry",
    type: "revenue",
    size: "4.2 MB",
  },
];

export function AnalyticsPreview() {
  const { data, isLoading } = useDashboardStats();

  const handleDownloadReport = async (type: string) => {
    try {
      const response = await apiClient.get(`/reports/export?type=${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully.");
    } catch (err) {
      toast.error("Failed to generate and download report.");
    }
  };

  if (isLoading || !data) {
    return (
      <Card className="w-full">
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const { trends, top_writers, client_activity } = data;

  // 1. Programmatically plot Assignment Volume trend line
  const maxVolume = Math.max(...trends.volumes, 1);
  const linePoints = trends.volumes.map((v, i) => {
    const x = 10 + i * 55;
    const y = 110 - (v / maxVolume) * 95;
    return { x, y };
  });

  const linePath = linePoints.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, "");

  const gradPath =
    linePoints.length > 0
      ? `${linePath} L ${linePoints[linePoints.length - 1].x} 110 L ${linePoints[0].x} 110 Z`
      : "";

  // 2. Programmatically plot Inflow bars heights
  const maxInflow = Math.max(...trends.inflows, 1);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">
            Analytics & Performance Preview
          </CardTitle>
          <CardDescription>
            High-level metrics, trend projections, and system report downloads.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="bg-muted/50 grid h-auto w-full grid-cols-2 rounded-lg p-1 md:grid-cols-4">
            <TabsTrigger value="trends" className="py-2">
              Assignment & Revenue Trends
            </TabsTrigger>
            <TabsTrigger value="writers" className="py-2">
              Writer Performance
            </TabsTrigger>
            <TabsTrigger value="clients" className="py-2">
              Client Activity
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-2">
              Monthly Reports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Assignment & Revenue Trends */}
          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Assignment Trends Chart */}
              <div className="border-border space-y-4 rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Assignment Trends
                    </span>
                    <h4 className="text-foreground text-xl font-bold">
                      Monthly Volume
                    </h4>
                  </div>
                  <div className="text-success flex items-center gap-1.5 text-xs">
                    <TrendingUp className="size-4" />
                    <span>Real-time briefs count</span>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="flex h-48 w-full items-end">
                  <svg className="h-full w-full" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--primary)"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--primary)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="20"
                      x2="300"
                      y2="20"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="60"
                      x2="300"
                      y2="60"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="300"
                      y2="100"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />

                    {/* Gradient area */}
                    {gradPath && <path d={gradPath} fill="url(#lineGrad)" />}
                    {/* Chart Line */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}
                    {/* Points */}
                    {linePoints.map((p, idx) => {
                      const val = trends.volumes[idx];
                      return (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              className="cursor-pointer fill-background stroke-primary stroke-2 hover:r-[6.5] transition-all"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="font-semibold">{val} assignments</span>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </svg>
                </div>
                <div className="text-muted-foreground flex justify-between px-2 font-mono text-[10px] uppercase">
                  {trends.months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Revenue Trends Chart */}
              <div className="border-border space-y-4 rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Revenue Trends
                    </span>
                    <h4 className="text-foreground text-xl font-bold">
                      Monthly Inflow
                    </h4>
                  </div>
                  <div className="text-success flex items-center gap-1.5 text-xs">
                    <TrendingUp className="size-4" />
                    <span>Real-time earnings inflow</span>
                  </div>
                </div>

                {/* SVG Bar Chart */}
                <div className="flex h-48 w-full items-end">
                  <svg className="h-full w-full" viewBox="0 0 300 120">
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="20"
                      x2="300"
                      y2="20"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="60"
                      x2="300"
                      y2="60"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="300"
                      y2="100"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />

                    {/* Bars */}
                    {trends.inflows.map((inf, i) => {
                      const x = 15 + i * 48;
                      const height = (inf / maxInflow) * 95;
                      const y = 110 - height;
                      return (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <rect
                              x={x}
                              y={y}
                              width="22"
                              height={height}
                              rx="3"
                              className="cursor-pointer transition-opacity hover:opacity-85"
                              fill="var(--primary)"
                              fillOpacity={0.4 + i * 0.1}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="font-semibold">PKR {inf.toLocaleString()}</span>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </svg>
                </div>
                <div className="text-muted-foreground flex justify-between px-4 font-mono text-[10px] uppercase">
                  {trends.months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Writer Performance */}
          <TabsContent value="writers" className="mt-6">
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Writer
                    </th>
                    <th className="text-foreground px-4 py-3 text-center font-semibold">
                      Completed Assignments
                    </th>
                    <th className="text-foreground px-4 py-3 text-center font-semibold">
                      Average Rating
                    </th>
                    <th className="text-foreground px-4 py-3 text-right font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {top_writers.map((writer) => (
                    <tr
                      key={writer.name}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="flex items-center gap-2 px-4 py-3 font-medium">
                        <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-xs font-bold">
                          {writer.name.charAt(0)}
                        </div>
                        <span>{writer.name}</span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-center font-mono tabular-nums">
                        {writer.assignments}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="fill-primary text-primary size-3.5" />
                          <span className="text-foreground font-semibold">
                            {writer.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant="outline"
                          className={
                            writer.status === "active"
                              ? "border-success/30 bg-success/10 text-success capitalize"
                              : "border-muted-foreground/30 bg-muted/10 text-muted-foreground capitalize"
                          }
                        >
                          {writer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {top_writers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground px-4 py-8 text-center"
                      >
                        No data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 3: Client Activity */}
          <TabsContent value="clients" className="mt-6">
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Client
                    </th>
                    <th className="text-foreground px-4 py-3 text-center font-semibold">
                      Active Briefs
                    </th>
                    <th className="text-foreground px-4 py-3 text-center font-semibold">
                      Total Spend
                    </th>
                    <th className="text-foreground px-4 py-3 text-right font-semibold">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {client_activity.map((client) => (
                    <tr
                      key={client.name}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="flex items-center gap-2 px-4 py-3 font-medium">
                        <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-xs font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <span>{client.name}</span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-center font-mono tabular-nums">
                        {client.active}
                      </td>
                      <td className="text-foreground px-4 py-3 text-center font-semibold">
                        {client.spend}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                        {client.lastActive}
                      </td>
                    </tr>
                  ))}
                  {client_activity.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground px-4 py-8 text-center"
                      >
                        No data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: Monthly Reports */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {PERFORMANCE_REPORTS.map((report) => (
                <div
                  key={report.title}
                  className="border-border bg-card hover:bg-sidebar-accent/30 flex items-center justify-between rounded-xl border p-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                      <FileText className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-foreground text-sm leading-tight font-semibold">
                        {report.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {report.size} • Dynamic CSV Export
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10"
                    onClick={() => handleDownloadReport(report.type)}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
