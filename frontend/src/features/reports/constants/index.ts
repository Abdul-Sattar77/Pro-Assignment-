import { REPORT_TYPE, type ReportFilter, type ReportType } from "../types";

export const REPORTS_QUERY_KEYS = {
  all: ["reports"] as const,
  view: (filters: ReportFilter) => ["reports", "view", filters] as const,
};

interface ReportMeta {
  label: string;
  description: string;
}

export const REPORT_META: Record<ReportType, ReportMeta> = {
  [REPORT_TYPE.ASSIGNMENTS]: {
    label: "Assignments Report",
    description:
      "Detailed summary of all assignment workflows, pricing, costs, and profits.",
  },
  [REPORT_TYPE.CLIENTS]: {
    label: "Clients Report",
    description:
      "Overview of client active work, total orders, and lifetime value.",
  },
  [REPORT_TYPE.WRITERS]: {
    label: "Writers Report",
    description:
      "Overview of active writer workloads, completed assignments, and payouts.",
  },
  [REPORT_TYPE.PMS]: {
    label: "Project Managers Report",
    description:
      "Performance overview of project manager workloads and orders handled.",
  },
  [REPORT_TYPE.REVENUE]: {
    label: "Revenue Report",
    description:
      "Detailed inflow tracking (advance, partial, balance payments) by client and status.",
  },
  [REPORT_TYPE.EXPENSES]: {
    label: "Expenses Report",
    description:
      "Detailed outflow tracking (writer payouts, operational expenses) by payee/type.",
  },
  [REPORT_TYPE.PERFORMANCE]: {
    label: "Performance Report",
    description:
      "Workload distribution and writer timeliness (on-time completion ratios).",
  },
};

export const REPORT_OPTIONS = Object.entries(REPORT_META).map(
  ([value, meta]) => ({
    value: value as ReportType,
    label: meta.label,
  }),
);
