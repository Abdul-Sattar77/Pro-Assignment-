"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard, AuthProvider } from "@/features/auth";

/**
 * Protected route group. AuthProvider resolves the session (single deduped
 * /auth/me), AuthGuard redirects unauthenticated visitors to /login, and
 * AppShell provides the sidebar + topbar chrome for all module pages.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </AuthProvider>
  );
}
