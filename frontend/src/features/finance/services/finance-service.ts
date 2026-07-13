import { apiClient } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
  Payment,
  PaymentFilters,
  PaymentsPage,
  FinanceStats,
  RecordPaymentPayload,
  UpdateInvoicePayload,
  VerifyPaymentPayload,
} from "../types";

interface InvoiceListEnvelope {
  data: Invoice[];
  meta: { pagination: any };
}

interface InvoiceItemEnvelope {
  data: Invoice;
}

interface PaymentListEnvelope {
  data: Payment[];
  meta: { pagination: any };
}

interface PaymentItemEnvelope {
  data: Payment;
}

interface StatsEnvelope {
  data: FinanceStats;
}

export const financeService = {
  async listInvoices(filters: InvoiceFilters): Promise<InvoicesPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.clientId) params["filter[clientId]"] = filters.clientId;
    if (filters.assignmentId) params["filter[assignmentId]"] = filters.assignmentId;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<InvoiceListEnvelope>("/invoices", {
      params,
    });
    return { invoices: data.data, pagination: data.meta.pagination };
  },

  async getInvoice(id: string): Promise<Invoice> {
    const { data } = await apiClient.get<InvoiceItemEnvelope>(`/invoices/${id}`);
    return data.data;
  },

  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const { data } = await apiClient.post<InvoiceItemEnvelope>("/invoices", payload);
    return data.data;
  },

  async updateInvoice(id: string, payload: UpdateInvoicePayload): Promise<Invoice> {
    const { data } = await apiClient.patch<InvoiceItemEnvelope>(`/invoices/${id}`, payload);
    return data.data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  async listPayments(filters: PaymentFilters): Promise<PaymentsPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.paymentType) params["filter[paymentType]"] = filters.paymentType;
    if (filters.assignmentId) params["filter[assignmentId]"] = filters.assignmentId;
    if (filters.userId) params["filter[userId]"] = filters.userId;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get<PaymentListEnvelope>("/payments", {
      params,
    });
    return { payments: data.data, pagination: data.meta.pagination };
  },

  async getPayment(id: string): Promise<Payment> {
    const { data } = await apiClient.get<PaymentItemEnvelope>(`/payments/${id}`);
    return data.data;
  },

  async recordPayment(payload: RecordPaymentPayload): Promise<Payment> {
    const { data } = await apiClient.post<PaymentItemEnvelope>("/payments", payload);
    return data.data;
  },

  async verifyPayment(id: string, payload: VerifyPaymentPayload): Promise<Payment> {
    const { data } = await apiClient.post<PaymentItemEnvelope>(`/payments/${id}/verify`, payload);
    return data.data;
  },

  async deletePayment(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },

  async getStats(): Promise<FinanceStats> {
    const { data } = await apiClient.get<StatsEnvelope>("/finance/stats");
    return data.data;
  },
};
