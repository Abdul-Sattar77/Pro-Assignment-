import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import { ApiError } from "@/lib/http-error";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types";

interface Envelope<T> {
  data: T;
}

/**
 * Typed API calls for the auth feature. State-changing requests prime the
 * Sanctum CSRF cookie first (idempotent). Components never call this directly —
 * they go through the hooks in `../hooks`.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<Envelope<AuthUser>>(
      "/auth/login",
      payload,
    );
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<Envelope<AuthUser>>(
      "/auth/register",
      {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        // Laravel's `confirmed` rule expects snake_case pairing.
        password_confirmation: payload.passwordConfirmation,
      },
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.post("/auth/logout");
  },

  /** Current session user, or null when unauthenticated (401). */
  async me(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<Envelope<AuthUser>>("/auth/me");
      return data.data;
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthenticated) {
        return null;
      }
      throw error;
    }
  },
};
