import { apiClient } from "@/lib/api-client";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  TasksPage,
  PaginationMeta,
  UpdateTaskPayload,
} from "../types";

interface ListEnvelope {
  data: Task[];
  meta: { pagination: PaginationMeta };
}

interface ItemEnvelope {
  data: Task;
}

export const tasksService = {
  async list(filters: TaskFilters): Promise<TasksPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.priority) params["filter[priority]"] = filters.priority;
    if (filters.assignedUser)
      params["filter[assignedUser]"] = filters.assignedUser;
    if (filters.assignment) params["filter[assignment]"] = filters.assignment;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<ListEnvelope>("/tasks", {
      params,
    });
    return { tasks: data.data, pagination: data.meta.pagination };
  },

  async get(id: string): Promise<Task> {
    const { data } = await apiClient.get<ItemEnvelope>(`/tasks/${id}`);
    return data.data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiClient.post<ItemEnvelope>("/tasks", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await apiClient.patch<ItemEnvelope>(
      `/tasks/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async assign(id: string, assignedUserId: string | null): Promise<Task> {
    const { data } = await apiClient.post<ItemEnvelope>(`/tasks/${id}/assign`, {
      assignedUserId,
    });
    return data.data;
  },

  async complete(id: string): Promise<Task> {
    const { data } = await apiClient.post<ItemEnvelope>(
      `/tasks/${id}/complete`,
    );
    return data.data;
  },

  async cancel(id: string): Promise<Task> {
    const { data } = await apiClient.post<ItemEnvelope>(`/tasks/${id}/cancel`);
    return data.data;
  },
};
