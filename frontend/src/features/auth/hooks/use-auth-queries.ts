"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { ROUTES } from "@/constants/routes";
import { AUTH_QUERY_KEYS } from "../constants";
import { authService } from "../services/auth-service";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types";

/**
 * Server-state hooks for authentication. Components use these — never the
 * service or axios directly. React Query dedupes the session lookup app-wide.
 */
export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    AuthUser,
    ApiError,
    LoginPayload & { redirectTo?: string }
  >({
    mutationFn: (variables) =>
      authService.login({
        email: variables.email,
        password: variables.password,
        remember: variables.remember,
      }),
    onSuccess: (user, variables) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.replace(variables.redirectTo ?? ROUTES.dashboard);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthUser, ApiError, RegisterPayload>({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
      toast.success(
        `Welcome, ${user.name.split(" ")[0]}! Your account is ready.`,
      );
      router.replace(ROUTES.dashboard);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, ApiError>({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Clear ALL cached server state — nothing user-scoped may survive logout.
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null);
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
      router.replace(ROUTES.login);
    },
  });
}
