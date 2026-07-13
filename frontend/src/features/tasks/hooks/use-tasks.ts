"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { TASKS_QUERY_KEYS } from "../constants";
import { tasksService } from "../services/tasks-service";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  TasksPage,
  UpdateTaskPayload,
} from "../types";

export function useTasks(filters: TaskFilters) {
  return useQuery<TasksPage, ApiError>({
    queryKey: TASKS_QUERY_KEYS.list(filters),
    queryFn: () => tasksService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useTask(id: string) {
  return useQuery<Task, ApiError>({
    queryKey: TASKS_QUERY_KEYS.detail(id),
    queryFn: () => tasksService.get(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, CreateTaskPayload>({
    mutationFn: (payload) => tasksService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task created successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to create task."),
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, UpdateTaskPayload>({
    mutationFn: (payload) => tasksService.update(taskId, payload),
    onSuccess: (task) => {
      queryClient.setQueryData(TASKS_QUERY_KEYS.detail(taskId), task);
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update task."),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => tasksService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete task."),
  });
}

export function useAssignTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, string | null>({
    mutationFn: (userId) => tasksService.assign(taskId, userId),
    onSuccess: (task) => {
      queryClient.setQueryData(TASKS_QUERY_KEYS.detail(taskId), task);
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task assignee updated.");
    },
    onError: (error) => toast.error(error.message || "Failed to update assignee."),
  });
}

export function useCompleteTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, void>({
    mutationFn: () => tasksService.complete(taskId),
    onSuccess: (task) => {
      queryClient.setQueryData(TASKS_QUERY_KEYS.detail(taskId), task);
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task completed.");
    },
    onError: (error) => toast.error(error.message || "Failed to complete task."),
  });
}

export function useCancelTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, void>({
    mutationFn: () => tasksService.cancel(taskId),
    onSuccess: (task) => {
      queryClient.setQueryData(TASKS_QUERY_KEYS.detail(taskId), task);
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEYS.all,
      });
      toast.success("Task cancelled.");
    },
    onError: (error) => toast.error(error.message || "Failed to cancel task."),
  });
}
