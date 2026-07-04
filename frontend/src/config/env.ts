/**
 * Typed, centralized environment access.
 * Every `process.env` read goes through here. Only `NEXT_PUBLIC_*` values
 * are available in the browser (see docs/conventions/frontend-standards.md).
 */
export const env = {
  /** Laravel API origin, e.g. http://localhost:8000 (no trailing slash). */
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  ),
  /** Frontend origin, e.g. http://localhost:3000. */
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
