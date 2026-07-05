"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientShell } from "@/components/layout/client-shell";
import { AuthGuard, AuthProvider } from "@/features/auth";
import { usePortalRole } from "@/features/dashboard";

/**
 * Chrome is role-branched (project rule): staff (admin/PM/writer) get the
 * admin workspace shell; clients get the landing-style studio shell.
 * Must render inside AuthProvider, hence the inner component.
 */
function RoleShell({ children }: { children: ReactNode }) {
  const portal = usePortalRole();

  if (portal === "client") {
    return <ClientShell>{children}</ClientShell>;
  }
  return <AppShell>{children}</AppShell>;
}

/**
 * Protected route group. AuthProvider resolves the session (single deduped
 * /auth/me), AuthGuard redirects unauthenticated visitors to /login, and
 * RoleShell picks the chrome for the user's role.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <RoleShell>{children}</RoleShell>
      </AuthGuard>
    </AuthProvider>
  );
}
