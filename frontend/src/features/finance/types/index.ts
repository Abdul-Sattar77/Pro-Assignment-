/**
 * Finance domain types — mirror the backend Resource contracts.
 */
export const INVOICE_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_TYPE = {
  ADVANCE: "advance",
  PARTIAL: "partial",
  BALANCE: "balance",
  WRITER_PAYOUT: "writer_payout",
  EXPENSE: "expense",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export interface Invoice {
  id: string; // uuid
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  statusLabel: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignment?: {
    id: string;
    title: string;
    clientPrice: number;
    writerCost: number;
    discount: number;
    netProfit: number;
  } | null;
}

export interface Payment {
  id: string; // uuid
  amount: number;
  paymentMethod: string;
  paymentType: PaymentType;
  paymentTypeLabel: string;
  status: PaymentStatus;
  statusLabel: string;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  assignment?: {
    id: string;
    title: string;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  verifiedBy?: {
    id: string;
    name: string;
  } | null;
  proofFile?: {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    humanSize: string;
    mimeType: string;
    downloadUrl: string;
  } | null;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  assignmentId?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  paymentType?: PaymentType;
  assignmentId?: string;
  userId?: string;
  page?: number;
  perPage?: number;
  sort?: string;
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

export interface PaymentsPage {
  payments: Payment[];
  pagination: PaginationMeta;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  monthlyBreakdown: MonthlyStats[];
  pendingVerificationCount: number;
  recentPayments: Payment[];
}

export interface CreateInvoicePayload {
  assignmentId: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoicePayload {
  status?: InvoiceStatus;
  dueDate?: string;
  notes?: string;
}

export interface RecordPaymentPayload {
  assignmentId?: string | null;
  invoiceId?: string | null;
  userId?: string | null;
  amount: number;
  paymentMethod?: string;
  paymentType: PaymentType;
  proofFileId?: string | null;
  verified?: boolean;
  notes?: string;
}

export interface VerifyPaymentPayload {
  status: PaymentStatus;
  notes?: string;
}
