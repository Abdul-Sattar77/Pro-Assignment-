import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  FinanceSummary,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
  PaginationMeta,
} from "../types";

interface ListEnvelope {
  data: Invoice[];
  meta: { pagination: PaginationMeta };
}
interface ItemEnvelope {
  data: Invoice;
}
interface SummaryEnvelope {
  data: FinanceSummary;
}

/** Typed API calls for finance (invoices + payments). */
export const financeService = {
  async list(filters: InvoiceFilters): Promise<InvoicesPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;

    const { data } = await apiClient.get<ListEnvelope>("/invoices", { params });
    return { invoices: data.data, pagination: data.meta.pagination };
  },

  async summary(): Promise<FinanceSummary> {
    const { data } = await apiClient.get<SummaryEnvelope>("/finance/summary");
    return data.data;
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>("/invoices", {
      assignmentId: payload.assignmentId,
      amount: payload.amount,
      description: payload.description,
    });
    return data.data;
  },

  async submitPayment(id: string, reference: string): Promise<Invoice> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/invoices/${id}/submit-payment`,
      { reference },
    );
    return data.data;
  },

  async verify(id: string): Promise<Invoice> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/invoices/${id}/verify`,
    );
    return data.data;
  },

  async cancel(id: string): Promise<Invoice> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/invoices/${id}/cancel`,
    );
    return data.data;
  },
};
