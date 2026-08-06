"use client";

import { useAuth } from "@/features/auth";

const STAFF_ROLES = ["admin", "project_manager", "writer", "sales"] as const;

/**
 * Which portal experience the signed-in user gets (project rule:
 * clients see the landing-style studio, staff see the admin workspace).
 */
export function usePortalRole(): "client" | "staff" {
  const { hasRole } = useAuth();
  const isStaff = STAFF_ROLES.some((role) => hasRole(role));
  return isStaff ? "staff" : "client";
}
