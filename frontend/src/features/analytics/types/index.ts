/**
 * Analytics domain TypeScript types.
 */
export interface AnalyticsKpi {
  totalClients: number;
  totalWriters: number;
  activeAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  revenueOverview: number;
  monthlyGrowth: number;
  dueAssignments: number;
  overdueAssignments: number;
}

export interface TrendItem {
  month: string;
  count: number;
}

export interface RevenueTrendItem {
  month: string;
  total: number;
}

export interface WriterPerfItem {
  name: string;
  email: string;
  completedCount: number;
}

export interface ClientActivityItem {
  name: string;
  email: string;
  orderCount: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKpi;
  charts: {
    assignmentTrends: TrendItem[];
    revenueTrends: RevenueTrendItem[];
    writerPerformance: WriterPerfItem[];
    clientActivity: ClientActivityItem[];
  };
}
