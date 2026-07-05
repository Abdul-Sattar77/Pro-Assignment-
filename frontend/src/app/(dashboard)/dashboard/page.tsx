"use client";

import { ClientHome, StaffOverview, usePortalRole } from "@/features/dashboard";

/**
 * Dashboard landing — role-branched content (project rule): clients get the
 * cinematic studio home; staff get the workspace overview.
 */
export default function DashboardPage() {
  const portal = usePortalRole();

  return portal === "client" ? <ClientHome /> : <StaffOverview />;
}
