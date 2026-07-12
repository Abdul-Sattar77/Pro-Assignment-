import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type { AuthUser } from "../types";

interface Envelope<T> {
  data: T;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  university?: string;
  department?: string;
  studyYear?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

/** Typed API calls for the signed-in user's own account. */
export const profileService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<Envelope<AuthUser>>("/profile", {
      name: payload.name,
      email: payload.email,
      university: payload.university || null,
      department: payload.department || null,
      study_year: payload.studyYear || null,
    });
    return data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.post("/profile/password", {
      currentPassword: payload.currentPassword,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    });
  },

  /** Request a reset link (public). Response never reveals if the email exists. */
  async forgotPassword(email: string): Promise<string> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<Envelope<{ message: string }>>(
      "/auth/forgot-password",
      { email },
    );
    return data.data.message;
  },

  /** Complete a reset with the emailed token (public). */
  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<string> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<Envelope<{ message: string }>>(
      "/auth/reset-password",
      {
        token: payload.token,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      },
    );
    return data.data.message;
  },
};
