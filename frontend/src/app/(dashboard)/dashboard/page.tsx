"use client";

import { ClientHome, StaffOverview, usePortalRole } from "@/features/dashboard";
import { useAuth } from "@/features/auth";
import { AdminDashboard } from "./components/admin-dashboard";

/**
 * Dashboard landing — role-branched content (project rule): clients get the
 * cinematic studio home; admin gets the admin control dashboard; other staff get the workspace overview.
 */
export default function DashboardPage() {
  const portal = usePortalRole();
  const { hasRole } = useAuth();

  if (portal === "client") {
    return <ClientHome />;
  }

  if (hasRole("admin")) {
    return <AdminDashboard />;
  }

  return <StaffOverview />;
}
