"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { rolesService } from "../services/roles-service";
import type { Role, Permission, RolePayload } from "../types";

export const ROLES_QUERY_KEYS = {
  all: ["roles"] as const,
  permissions: ["permissions"] as const,
};

export function useRoles() {
  return useQuery<Role[], ApiError>({
    queryKey: ROLES_QUERY_KEYS.all,
    queryFn: () => rolesService.list(),
    staleTime: 30 * 1000,
  });
}

export function usePermissions() {
  return useQuery<Permission[], ApiError>({
    queryKey: ROLES_QUERY_KEYS.permissions,
    queryFn: () => rolesService.permissions(),
    staleTime: 5 * 60 * 1000, // Permissions catalog rarely changes
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<Role, ApiError, RolePayload>({
    mutationFn: (payload) => rolesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.all });
      toast.success("Role created successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to create role."),
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Role, ApiError, RolePayload>({
    mutationFn: (payload) => rolesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.all });
      toast.success("Role updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update role."),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => rolesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.all });
      toast.success("Role deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete role."),
  });
}
