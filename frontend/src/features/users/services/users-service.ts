import { apiClient } from "@/lib/api-client";
import type {
  CreateUserPayload,
  PaginationMeta,
  UpdateUserPayload,
  UserFilters,
  UserListItem,
  UsersPage,
} from "../types";

interface ListEnvelope {
  data: UserListItem[];
  meta: { pagination: PaginationMeta };
}

interface ItemEnvelope {
  data: UserListItem;
}

export const usersService = {
  async list(filters: UserFilters): Promise<UsersPage> {
    const params: Record<string, string | number> = {};

    if (filters.search) params.search = filters.search;
    if (filters.role) params["filter[role]"] = filters.role;
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<ListEnvelope>("/users", {
      params,
    });

    return {
      users: data.data,
      pagination: data.meta.pagination,
    };
  },

  async create(payload: CreateUserPayload): Promise<UserListItem> {
    const { data } = await apiClient.post<ItemEnvelope>("/users", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<UserListItem> {
    const body: Record<string, unknown> = {};

    if (payload.name !== undefined) body.name = payload.name;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.password) body.password = payload.password;
    if (payload.roles !== undefined) body.roles = payload.roles;
    if (payload.isActive !== undefined) body.is_active = payload.isActive;

    const { data } = await apiClient.patch<ItemEnvelope>(`/users/${id}`, body);

    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
