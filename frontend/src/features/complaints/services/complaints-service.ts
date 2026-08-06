import { apiClient } from "@/lib/api-client";
import type {
  Complaint,
  ComplaintFilters,
  SubmitComplaintPayload,
  ResolveComplaintPayload,
} from "../types";

interface Envelope<T> {
  data: T;
}

interface PaginatedEnvelope<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  };
}

export const complaintsService = {
  async list(filters: ComplaintFilters) {
    const params: Record<string, string | number> = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<PaginatedEnvelope<Complaint[]>>(
      "/complaints",
      {
        params,
      },
    );

    return {
      complaints: data.data,
      pagination: {
        page: data.meta.pagination.page,
        perPage: data.meta.pagination.perPage,
        total: data.meta.pagination.total,
        totalPages: data.meta.pagination.totalPages,
      },
    };
  },

  async get(id: string): Promise<Complaint> {
    const { data } = await apiClient.get<Envelope<Complaint>>(
      `/complaints/${id}`,
    );
    return data.data;
  },

  async create(payload: SubmitComplaintPayload): Promise<Complaint> {
    const { data } = await apiClient.post<Envelope<Complaint>>(
      "/complaints",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: ResolveComplaintPayload,
  ): Promise<Complaint> {
    const { data } = await apiClient.patch<Envelope<Complaint>>(
      `/complaints/${id}`,
      payload,
    );
    return data.data;
  },
};
