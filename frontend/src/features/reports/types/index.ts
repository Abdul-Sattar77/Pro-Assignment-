/**
 * Reports domain TypeScript types.
 */
export const REPORT_TYPE = {
  ASSIGNMENTS: "assignments",
  CLIENTS: "clients",
  WRITERS: "writers",
  PMS: "pms",
  REVENUE: "revenue",
  EXPENSES: "expenses",
  PERFORMANCE: "performance",
} as const;

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];

export interface ReportFilter {
  type: ReportType;
  from?: string;
  to?: string;
}

export interface MetricItem {
  label: string;
  value: string | number;
}

export interface ReportData {
  metrics: MetricItem[];
  statusSummary?: Record<string, number>;
  headers: string[];
  rows: Record<string, any>[];
}
