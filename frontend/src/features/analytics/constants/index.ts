export const ANALYTICS_QUERY_KEYS = {
  all: ["analytics"] as const,
  dashboard: () => ["analytics", "dashboard"] as const,
};
