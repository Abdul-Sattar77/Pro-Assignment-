import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";
import { ApiError } from "@/lib/http-error";

/**
 * The single Axios instance for the whole app.
 * - `withCredentials`   → sends the Sanctum httpOnly session + XSRF cookies
 * - `withXSRFToken`     → attaches the XSRF-TOKEN cookie as X-XSRF-TOKEN header
 * - response interceptor → normalizes every failure to {@link ApiError}
 *
 * Feature `services/` call this. Components/hooks never touch axios directly
 * (docs/conventions/frontend-standards.md §6).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { Accept: "application/json" },
});

/**
 * Prime the CSRF cookie from Sanctum before the first stateful request
 * (login/register/any write). Idempotent — safe to call repeatedly.
 */
export async function ensureCsrfCookie(): Promise<void> {
  await axios.get(`${env.apiUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

interface ErrorEnvelope {
  error?: { code: string; message: string; details?: Record<string, string[]> };
  meta?: { requestId?: string };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    const normalized = new ApiError({
      code:
        body?.error?.code ??
        (status === 0 ? "NETWORK_ERROR" : "REQUEST_FAILED"),
      message:
        body?.error?.message ??
        (status === 0
          ? "Unable to reach the server. Check your connection and try again."
          : "Something went wrong. Please try again."),
      details: body?.error?.details,
      status,
      requestId: body?.meta?.requestId,
    });

    // 401 → login redirect is handled at the app layer (auth guard / event),
    // keeping this module framework-agnostic and testable.
    return Promise.reject(normalized);
  },
);
