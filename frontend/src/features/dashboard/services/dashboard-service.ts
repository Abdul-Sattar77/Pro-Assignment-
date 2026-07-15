import { apiClient } from "@/lib/api-client";

interface Envelope<T> {
  data: T;
}

export interface DashboardStats {
  stats: {
    revenue: number;
    expenses: number;
    profit: number;
    active_assignments: number;
    completed_assignments: number;
    pending_assignments: number;
    overdue_assignments: number;
    due_assignments: number;
    total_clients: number;
    total_writers: number;
    total_pms: number;
  };
  recent_assignments: {
    id: string;
    name: string;
    client: string;
    subject: string;
    priority: "high" | "medium" | "low";
    status: "in_progress" | "completed" | "pending" | "overdue";
    deadline: string;
  }[];
  recent_activities: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    iconName: string;
    iconBg: string;
    iconColor: string;
  }[];
  trends: {
    months: string[];
    volumes: number[];
    inflows: number[];
  };
  top_writers: {
    name: string;
    assignments: number;
    rating: number;
    status: "active" | "inactive";
  }[];
  client_activity: {
    name: string;
    active: number;
    spend: string;
    lastActive: string;
  }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } =
      await apiClient.get<Envelope<DashboardStats>>("/dashboard/stats");
    return data.data;
  },
};
