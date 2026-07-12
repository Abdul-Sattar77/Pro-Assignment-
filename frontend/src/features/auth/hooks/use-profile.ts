"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { AUTH_QUERY_KEYS } from "../constants";
import {
  profileService,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
} from "../services/profile-service";
import type { AuthUser } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, ApiError, UpdateProfilePayload>({
    mutationFn: (payload) => profileService.updateProfile(payload),
    onSuccess: (user) => {
      // Keep the app-wide session cache in sync.
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
      toast.success("Profile updated.");
    },
  });
}

export function useChangePassword() {
  return useMutation<void, ApiError, ChangePasswordPayload>({
    mutationFn: (payload) => profileService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password updated.");
    },
  });
}
