import {
  INVOICE_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type InvoiceFilters,
  type InvoiceStatus,
  type PaymentFilters,
  type PaymentStatus,
  type PaymentType,
} from "../types";

/** React Query keys. */
export const FINANCE_QUERY_KEYS = {
  allInvoices: ["invoices"] as const,
  invoicesList: (filters: InvoiceFilters) => ["invoices", "list", filters] as const,
  invoiceDetail: (id: string) => ["invoices", "detail", id] as const,

  allPayments: ["payments"] as const,
  paymentsList: (filters: PaymentFilters) => ["payments", "list", filters] as const,
  paymentDetail: (id: string) => ["payments", "detail", id] as const,

  stats: () => ["finance", "stats"] as const,
};

interface BadgeMeta {
  label: string;
  badgeClass: string;
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, BadgeMeta> = {
  [INVOICE_STATUS.DRAFT]: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  [INVOICE_STATUS.PENDING]: {
    label: "Pending Payment",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  [INVOICE_STATUS.PAID]: {
    label: "Paid",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [INVOICE_STATUS.OVERDUE]: {
    label: "Overdue",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
  [INVOICE_STATUS.CANCELLED]: {
    label: "Cancelled",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800",
  },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, BadgeMeta> = {
  [PAYMENT_STATUS.PENDING]: {
    label: "Pending Verification",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  [PAYMENT_STATUS.VERIFIED]: {
    label: "Verified",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [PAYMENT_STATUS.REJECTED]: {
    label: "Rejected",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
};

export const PAYMENT_TYPE_META: Record<PaymentType, BadgeMeta> = {
  [PAYMENT_TYPE.ADVANCE]: {
    label: "Advance Payment",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  [PAYMENT_TYPE.PARTIAL]: {
    label: "Partial Payment",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
  [PAYMENT_TYPE.BALANCE]: {
    label: "Remaining Balance",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [PAYMENT_TYPE.WRITER_PAYOUT]: {
    label: "Writer Payout",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  [PAYMENT_TYPE.EXPENSE]: {
    label: "Operational Expense",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
};

export const INVOICE_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-amount", label: "Highest amount" },
  { value: "amount", label: "Lowest amount" },
  { value: "due_date", label: "Due date (earliest)" },
  { value: "-due_date", label: "Due date (latest)" },
];

export const PAYMENT_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-amount", label: "Highest amount" },
  { value: "amount", label: "Lowest amount" },
];
