/**
 * Central route registry — the single source of route paths.
 * No hardcoded route strings anywhere else (docs/conventions golden rule #5).
 */
export const ROUTES = {
  home: "/",

  // Auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",

  // App
  dashboard: "/dashboard",
  assignments: "/assignments",
  leads: "/leads",
  messaging: "/messaging",
  files: "/files",
  finance: "/finance",
  reports: "/reports",
  analytics: "/analytics",
  calendar: "/calendar",
  tasks: "/tasks",
  users: "/users",
  roles: "/roles",
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
