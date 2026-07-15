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
  AdminAssignmentFilters,
  Assignment,
  AssignmentAction,
  AssignmentAttachment,
  AssignmentFilters,
  AssignmentsPage,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "../types";

export function useAssignments(
  filters: AssignmentFilters | AdminAssignmentFilters,
) {
  return useQuery<AssignmentsPage, ApiError>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.list(filters as AdminAssignmentFilters),
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

export function useUpdateAssignment(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<Assignment, ApiError, UpdateAssignmentPayload>({
    mutationFn: (payload) => assignmentsService.update(assignmentId, payload),
    onSuccess: (assignment) => {
      queryClient.setQueryData(
        ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
        assignment,
      );
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.all,
      });
      toast.success("Assignment updated.");
    },
    onError: (error) => toast.error(error.message),
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

/** Admin/PM: assign a project manager. */
export function useAssignManager(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<Assignment, ApiError, { managerId: string }>({
    mutationFn: ({ managerId }) =>
      assignmentsService.assignManager(assignmentId, managerId),
    onSuccess: (assignment) => {
      queryClient.setQueryData(
        ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
        assignment,
      );
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.all,
      });
      toast.success(
        `Project manager set to ${assignment.projectManager?.name ?? "manager"}.`,
      );
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
    {
      action: Exclude<AssignmentAction, "assign" | "assign_manager">;
      note?: string;
    }
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

/** Fetch attachments for an assignment. */
export function useAssignmentAttachments(assignmentId: string) {
  return useQuery<AssignmentAttachment[], ApiError>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.attachments(assignmentId),
    queryFn: () => assignmentsService.listAttachments(assignmentId),
    staleTime: 30 * 1000,
  });
}

/** Upload a file or voice note to an assignment. */
export function useUploadAttachment(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    AssignmentAttachment,
    ApiError,
    { file: File; type: "file" | "voice_note" }
  >({
    mutationFn: ({ file, type }) =>
      assignmentsService.uploadAttachment(assignmentId, file, type),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.attachments(assignmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
      });
      toast.success("File uploaded successfully.");
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Delete an attachment (admin only). */
export function useDeleteAttachment(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { attachmentId: string }>({
    mutationFn: ({ attachmentId }) =>
      assignmentsService.deleteAttachment(assignmentId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.attachments(assignmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.detail(assignmentId),
      });
      toast.success("Attachment deleted.");
    },
    onError: (error) => toast.error(error.message),
  });
}
