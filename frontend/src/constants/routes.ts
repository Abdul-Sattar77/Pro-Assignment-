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
  messaging: "/messages",
  files: "/files",
  finance: "/finance",
  reports: "/reports",
  analytics: "/analytics",
  calendar: "/calendar",
  tasks: "/tasks",
  users: "/users",
  roles: "/roles",
  settings: "/settings",
  complaints: "/complaints",
  documentTemplates: "/document-templates",
  auditLogs: "/audit-logs",
} as const;

export type RouteKey = keyof typeof ROUTES;
