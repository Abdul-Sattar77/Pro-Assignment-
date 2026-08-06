import { apiClient } from "@/lib/api-client";
import type {
  DocumentTemplate,
  TemplateFilters,
  CreateTemplatePayload,
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

export const templatesService = {
  async list(filters: TemplateFilters) {
    const params: Record<string, string | number> = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<PaginatedEnvelope<DocumentTemplate[]>>(
      "/document-templates",
      {
        params,
      },
    );

    return {
      templates: data.data,
      pagination: {
        page: data.meta.pagination.page,
        perPage: data.meta.pagination.perPage,
        total: data.meta.pagination.total,
        totalPages: data.meta.pagination.totalPages,
      },
    };
  },

  async create(payload: CreateTemplatePayload): Promise<DocumentTemplate> {
    const { data } = await apiClient.post<Envelope<DocumentTemplate>>(
      "/document-templates",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: CreateTemplatePayload,
  ): Promise<DocumentTemplate> {
    const { data } = await apiClient.patch<Envelope<DocumentTemplate>>(
      `/document-templates/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/document-templates/${id}`);
  },
};
