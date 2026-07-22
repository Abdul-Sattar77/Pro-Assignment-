import { apiClient } from "@/lib/api-client";
import type {
  CreateLeadPayload,
  CreateLeadQuotePayload,
  Lead,
  LeadFilters,
  LeadQuote,
  LeadsPage,
  PaginationMeta,
  UpdateLeadPayload,
} from "../types";

interface ListEnvelope {
  data: Lead[];
  meta: { pagination: PaginationMeta };
}

interface ItemEnvelope {
  data: Lead;
}

export const leadsService = {
  async list(filters: LeadFilters): Promise<LeadsPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.source) params["filter[source]"] = filters.source;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<ListEnvelope>("/leads", {
      params,
    });
    return { leads: data.data, pagination: data.meta.pagination };
  },

  async get(id: string): Promise<Lead> {
    const { data } = await apiClient.get<ItemEnvelope>(`/leads/${id}`);
    return data.data;
  },

  async create(payload: CreateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.post<ItemEnvelope>("/leads", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.patch<ItemEnvelope>(
      `/leads/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  },

  async listQuotes(leadId: string): Promise<LeadQuote[]> {
    const { data } = await apiClient.get<{ data: LeadQuote[] }>(
      `/leads/${leadId}/quotes`,
    );
    return data.data;
  },

  async createQuote(
    leadId: string,
    payload: CreateLeadQuotePayload,
  ): Promise<LeadQuote> {
    const { data } = await apiClient.post<{ data: LeadQuote }>(
      `/leads/${leadId}/quotes`,
      payload,
    );
    return data.data;
  },
};
