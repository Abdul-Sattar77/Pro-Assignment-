"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { USERS_QUERY_KEYS } from "../constants";
import { usersService } from "../services/users-service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserFilters,
  UserListItem,
  UsersPage,
} from "../types";

export function useUsers(filters: UserFilters) {
  return useQuery<UsersPage, ApiError>({
    queryKey: USERS_QUERY_KEYS.list(filters),
    queryFn: () => usersService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserListItem, ApiError, CreateUserPayload>({
    mutationFn: (payload) => usersService.create(payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(`${user.name} has been added.`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    UserListItem,
    ApiError,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: ({ id, payload }) => usersService.update(id, payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(`${user.name} has been updated.`);
    },
    onError: (error) => {
      // Domain guard violations (409) surface as toasts — they are not
      // field errors (e.g. LAST_ADMIN_PROTECTED).
      if (!error.isValidationError) {
        toast.error(error.message);
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, UserListItem>({
    mutationFn: (user) => usersService.remove(user.id),
    onSuccess: (_data, user) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(`${user.name} has been removed.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
