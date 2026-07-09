"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Star,
  TrendingUp,
} from "lucide-react";

// Mock data for Writer Performance
const TOP_WRITERS = [
  { name: "David K.", assignments: 45, rating: 4.9, status: "active" },
  { name: "Sarah M.", assignments: 38, rating: 4.8, status: "active" },
  { name: "James L.", assignments: 29, rating: 4.7, status: "on_leave" },
  { name: "Emma W.", assignments: 24, rating: 5.0, status: "active" },
];

// Mock data for Client Activity
const CLIENT_ACTIVITY = [
  { name: "Acme Corp", active: 12, spend: "$14,200", lastActive: "2h ago" },
  { name: "University of Tech", active: 8, spend: "$9,500", lastActive: "5h ago" },
  { name: "Nova Brands", active: 6, spend: "$7,800", lastActive: "1d ago" },
  { name: "DevFlow Inc.", active: 5, spend: "$5,400", lastActive: "3d ago" },
];

// Mock data for Performance Reports
const PERFORMANCE_REPORTS = [
  {
    title: "June 2026 Monthly Performance Report",
    size: "2.4 MB",
    generated: "Jul 1, 2026",
  },
  {
    title: "May 2026 Monthly Performance Report",
    size: "2.1 MB",
    generated: "Jun 1, 2026",
  },
  {
    title: "April 2026 Monthly Performance Report",
    size: "1.9 MB",
    generated: "May 1, 2026",
  },
  {
    title: "Q1 2026 Consolidated System Audit",
    size: "4.2 MB",
    generated: "Apr 1, 2026",
  },
];

export function AnalyticsPreview() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Analytics & Performance Preview</CardTitle>
          <CardDescription>
            High-level metrics, trend projections, and system report downloads.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-lg">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignment Trends Chart */}
              <div className="rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Assignment Trends
                    </span>
                    <h4 className="text-xl font-bold text-foreground">
                      Monthly Volume
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success">
                    <TrendingUp className="size-4" />
                    <span>+18.4% volume</span>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="h-48 w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient
                        id="lineGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="var(--border)" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="300" y2="100" stroke="var(--border)" strokeDasharray="3 3" />

                    {/* Gradient area */}
                    <path
                      d="M 10 100 Q 60 75 110 50 T 210 30 T 290 15 L 290 100 Z"
                      fill="url(#lineGrad)"
                    />
                    {/* Chart Line */}
                    <path
                      d="M 10 100 Q 60 75 110 50 T 210 30 T 290 15"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Points */}
                    <circle cx="10" cy="100" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="60" cy="75" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="110" cy="50" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="160" cy="40" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="210" cy="30" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="290" cy="15" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground uppercase px-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              {/* Revenue Trends Chart */}
              <div className="rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Revenue Trends
                    </span>
                    <h4 className="text-xl font-bold text-foreground">
                      Monthly Inflow
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success">
                    <TrendingUp className="size-4" />
                    <span>+8.2% earnings</span>
                  </div>
                </div>

                {/* SVG Bar Chart */}
                <div className="h-48 w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="var(--border)" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="300" y2="100" stroke="var(--border)" strokeDasharray="3 3" />

                    {/* Bars */}
                    <rect x="15" y="60" width="22" height="40" rx="3" fill="var(--primary)" fillOpacity="0.4" />
                    <rect x="65" y="50" width="22" height="50" rx="3" fill="var(--primary)" fillOpacity="0.5" />
                    <rect x="115" y="35" width="22" height="65" rx="3" fill="var(--primary)" fillOpacity="0.6" />
                    <rect x="165" y="45" width="22" height="55" rx="3" fill="var(--primary)" fillOpacity="0.7" />
                    <rect x="215" y="25" width="22" height="75" rx="3" fill="var(--primary)" fillOpacity="0.85" />
                    <rect x="265" y="15" width="22" height="85" rx="3" fill="var(--primary)" />
                  </svg>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground uppercase px-4">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Writer Performance */}
          <TabsContent value="writers" className="mt-6">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Writer
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Completed Assignments
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Average Rating
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TOP_WRITERS.map((writer) => (
                    <tr key={writer.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {writer.name.charAt(0)}
                        </div>
                        <span>{writer.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground tabular-nums">
                        {writer.assignments}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="size-3.5 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">
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
                          {writer.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 3: Client Activity */}
          <TabsContent value="clients" className="mt-6">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Client
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Active Briefs
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Total Spend
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CLIENT_ACTIVITY.map((client) => (
                    <tr key={client.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <span>{client.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground tabular-nums">
                        {client.active}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">
                        {client.spend}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground text-xs">
                        {client.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: Monthly Reports */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERFORMANCE_REPORTS.map((report) => (
                <div
                  key={report.title}
                  className="flex items-center justify-between rounded-xl border border-border p-4 bg-card hover:bg-sidebar-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {report.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {report.size} • Generated {report.generated}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
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
