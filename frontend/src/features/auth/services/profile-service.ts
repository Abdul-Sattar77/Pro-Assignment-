import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type { AuthUser, WriterProfile } from "../types";

interface Envelope<T> {
  data: T;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  university?: string;
  department?: string;
  studyYear?: string;
  availability?: "available" | "busy" | "away";
  expertise?: string | null;
  writerProfile?: WriterProfile | null;
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
    // Send only the fields present so a partial save (e.g. a writer updating
    // just availability) never clears untouched fields on the backend.
    const body: Record<string, unknown> = {
      name: payload.name,
      email: payload.email,
    };
    if (payload.university !== undefined)
      body.university = payload.university || null;
    if (payload.department !== undefined)
      body.department = payload.department || null;
    if (payload.studyYear !== undefined)
      body.study_year = payload.studyYear || null;
    if (payload.availability !== undefined)
      body.availability = payload.availability;
    if (payload.expertise !== undefined)
      body.expertise = payload.expertise || null;
    if (payload.writerProfile !== undefined)
      body.writer_profile = payload.writerProfile;

    const { data } = await apiClient.patch<Envelope<AuthUser>>(
      "/profile",
      body,
    );
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
