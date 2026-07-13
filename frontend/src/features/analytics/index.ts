/**
 * Public surface of the analytics feature. Other code imports ONLY from
 * here.
 */
export { useAnalytics } from "./hooks/use-analytics";

export type {
  AnalyticsKpi,
  TrendItem,
  RevenueTrendItem,
  WriterPerfItem,
  ClientActivityItem,
  AnalyticsData,
} from "./types";

export { AnalyticsDashboard } from "./components/analytics-dashboard";
