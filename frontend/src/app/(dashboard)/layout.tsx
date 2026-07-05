"use client";

import type { ReactNode } from "react";
import { AuthGuard, AuthProvider } from "@/features/auth";

/**
 * Protected route group. Everything inside requires an authenticated session:
 * AuthProvider resolves it (single deduped /auth/me), AuthGuard redirects
 * unauthenticated visitors to /login. The full app shell (sidebar, topbar)
 * mounts here as the Dashboard module is built out.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
