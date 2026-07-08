export type InvoiceStatus =
  "pending" | "awaiting_verification" | "paid" | "cancelled";

export type InvoiceAction = "submit_payment" | "verify" | "cancel";

export interface Invoice {
  id: string;
  number: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  statusLabel: string;
  description: string | null;
  paymentReference?: string | null;
  client?: string;
  assignment?: { id: string; title: string } | null;
  actions: InvoiceAction[];
  createdAt: string | null;
}

export interface FinanceSummary {
  currency: string;
  paidCents: number;
  outstandingCents: number;
  awaitingCents: number;
  invoiceCount: number;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  page?: number;
  perPage?: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface InvoicesPage {
  invoices: Invoice[];
  pagination: PaginationMeta;
}

export interface CreateInvoicePayload {
  assignmentId: string;
  amount: number;
  description?: string;
}
