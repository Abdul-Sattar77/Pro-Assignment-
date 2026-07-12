"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/http-error";
import { profileService } from "../services/profile-service";

export function useForgotPassword() {
  return useMutation<string, ApiError, string>({
    mutationFn: (email) => profileService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation<
    string,
    ApiError,
    {
      token: string;
      email: string;
      password: string;
      passwordConfirmation: string;
    }
  >({
    mutationFn: (payload) => profileService.resetPassword(payload),
  });
}
