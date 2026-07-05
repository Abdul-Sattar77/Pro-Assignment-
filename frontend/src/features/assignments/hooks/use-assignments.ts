"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { ASSIGNMENTS_QUERY_KEYS } from "../constants";
import { assignmentsService } from "../services/assignments-service";
import type {
  Assignment,
  AssignmentAction,
  AssignmentFilters,
  AssignmentsPage,
  CreateAssignmentPayload,
} from "../types";

export function useAssignments(filters: AssignmentFilters) {
  return useQuery<AssignmentsPage, ApiError>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.list(filters),
    queryFn: () => assignmentsService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useAssignment(id: string) {
  return useQuery<Assignment, ApiError>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.detail(id),
    queryFn: () => assignmentsService.get(id),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation<Assignment, ApiError, CreateAssignmentPayload>({
    mutationFn: (payload) => assignmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.all,
      });
      toast.success("Your order has been placed.");
    },
  });
}

/** PM: assign a writer to an order. */
export function useAssignWriter(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<Assignment, ApiError, { writerId: string }>({
    mutationFn: ({ writerId }) =>
      assignmentsService.assign(assignmentId, writerId),
    onSuccess: (assignment) => {
      queryClient.setQueryData(
        ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
        assignment,
      );
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.all,
      });
      toast.success(`Assigned to ${assignment.writer?.name ?? "writer"}.`);
    },
    onError: (error) => toast.error(error.message),
  });
}

/**
 * Any note-style workflow action. One hook powers every button on the action
 * bar — deliver, return, cancel today; accept/reject/submit (Writer panel)
 * reuse it as-is.
 */
export function useAssignmentAction(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Assignment,
    ApiError,
    { action: Exclude<AssignmentAction, "assign">; note?: string }
  >({
    mutationFn: ({ action, note }) =>
      assignmentsService.act(assignmentId, action, note),
    onSuccess: (assignment) => {
      queryClient.setQueryData(
        ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
        assignment,
      );
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.all,
      });
      toast.success(assignment.statusLabel);
    },
    onError: (error) => toast.error(error.message),
  });
}
