import { apiClient } from "@/lib/api-client";
import type { Role, Permission, RolePayload } from "../types";

interface Envelope<T> {
  data: T;
}

export const rolesService = {
  async list(): Promise<Role[]> {
    const { data } = await apiClient.get<Envelope<Role[]>>("/roles");
    return data.data;
  },

  async permissions(): Promise<Permission[]> {
    const { data } = await apiClient.get<Envelope<Permission[]>>("/permissions");
    return data.data;
  },

  async create(payload: RolePayload): Promise<Role> {
    const { data } = await apiClient.post<Envelope<Role>>("/roles", payload);
    return data.data;
  },

  async update(id: string, payload: RolePayload): Promise<Role> {
    const { data } = await apiClient.put<Envelope<Role>>(`/roles/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};
