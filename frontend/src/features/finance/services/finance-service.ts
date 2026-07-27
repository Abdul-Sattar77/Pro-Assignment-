import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  FinanceStats,
  FinanceSummary,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
  PaginationMeta,
  Payment,
  PaymentFilters,
  PaymentsPage,
  RecordPaymentPayload,
  VerifyPaymentPayload,
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

  async deleteInvoice(id: string): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.delete(`/invoices/${id}`);
  },

  // ---- Payments subsystem (admin panel) ----
  async listPayments(filters: PaymentFilters): Promise<PaymentsPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.paymentType)
      params["filter[payment_type]"] = filters.paymentType;
    if (filters.assignmentId)
      params["filter[assignment_id]"] = filters.assignmentId;
    if (filters.userId) params["filter[user_id]"] = filters.userId;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;

    const { data } = await apiClient.get<{
      data: Payment[];
      meta: { pagination: PaginationMeta };
    }>("/payments", { params });
    return { payments: data.data, pagination: data.meta.pagination };
  },

  async recordPayment(payload: RecordPaymentPayload): Promise<Payment> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ data: Payment }>(
      "/payments",
      payload,
    );
    return data.data;
  },

  async verifyPayment(
    id: string,
    payload: VerifyPaymentPayload,
  ): Promise<Payment> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ data: Payment }>(
      `/payments/${id}/verify`,
      payload,
    );
    return data.data;
  },

  async deletePayment(id: string): Promise<void> {
    await ensureCsrfCookie();
    await apiClient.delete(`/payments/${id}`);
  },

  async getStats(): Promise<FinanceStats> {
    const { data } = await apiClient.get<{ data: FinanceStats }>(
      "/finance/stats",
    );
    return data.data;
  },

  async listReminders(): Promise<import("../types").PaymentReminder[]> {
    const { data } = await apiClient.get<{
      data: import("../types").PaymentReminder[];
      meta?: unknown;
    }>("/finance/reminders");
    return Array.isArray(data.data) ? data.data : [];
  },

  async sendReminder(
    invoiceId: string,
    notes?: string,
  ): Promise<import("../types").PaymentReminder> {
    const { data } = await apiClient.post<{
      data: import("../types").PaymentReminder;
    }>(`/invoices/${invoiceId}/reminders`, {
      notes: notes || "Manual payment reminder dispatched by staff.",
    });
    return data.data;
  },
};
