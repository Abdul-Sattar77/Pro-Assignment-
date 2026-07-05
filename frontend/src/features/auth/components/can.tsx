"use client";

import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";

interface CanProps {
  /** Permission slug, e.g. "assignments.assign". */
  permission?: string;
  /** Role slug, e.g. "admin". Either prop (or both) may be given. */
  role?: string;
  /** Rendered when the check fails (default: nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * RBAC gate for conditional UI. UX-only — the backend enforces authorization;
 * this merely hides controls the user can't use (architecture §7).
 */
export function Can({ permission, role, fallback = null, children }: CanProps) {
  const { hasPermission, hasRole } = useAuth();

  const allowed =
    (permission === undefined || hasPermission(permission)) &&
    (role === undefined || hasRole(role));

  return allowed ? <>{children}</> : <>{fallback}</>;
}
