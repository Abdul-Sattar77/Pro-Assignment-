import type { UserFilters } from "../types";

/** React Query keys for the users feature. */
export const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  list: (filters: UserFilters) => ["users", "list", filters] as const,
};

/** Assignable roles (mirror backend App\Enums\Role). */
export const ASSIGNABLE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "project_manager", label: "Project Manager" },
  { value: "writer", label: "Writer" },
  { value: "client", label: "Client" },
] as const;
