import { apiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/http-error";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types";

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

interface MeResponse {
  data: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data.user;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      university: payload.university,
      department: payload.department,
      study_year: payload.studyYear,
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("token");
  },

  async me(): Promise<AuthUser | null> {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      return null;
    }
    try {
      const { data } = await apiClient.get<MeResponse>("/auth/me");
      return data.data;
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthenticated) {
        localStorage.removeItem("token");
        return null;
      }
      throw error;
    }
  },
};
