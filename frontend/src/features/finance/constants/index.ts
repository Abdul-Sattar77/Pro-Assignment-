import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type InvoiceStatus,
  type PaymentStatus,
  type PaymentType,
} from "../types";

/** cents → localized currency string. */
export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; className: string; badgeClass: string }
> = {
  pending: {
    label: "Awaiting payment",
    className: "text-amber-600 dark:text-amber-400",
    badgeClass:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  awaiting_verification: {
    label: "Verifying payment",
    className: "text-violet-600 dark:text-violet-400",
    badgeClass:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  },
  paid: {
    label: "Paid",
    className: "text-emerald-600 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-muted-foreground",
    badgeClass:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

export const INVOICE_STATUS_OPTIONS = Object.entries(INVOICE_STATUS_META).map(
  ([value, meta]) => ({ value: value as InvoiceStatus, label: meta.label }),
);

interface BadgeMeta {
  label: string;
  badgeClass: string;
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, BadgeMeta> = {
  [PAYMENT_STATUS.PENDING]: {
    label: "Pending Verification",
    badgeClass:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  [PAYMENT_STATUS.VERIFIED]: {
    label: "Verified",
    badgeClass:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [PAYMENT_STATUS.REJECTED]: {
    label: "Rejected",
    badgeClass:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
};

export const PAYMENT_TYPE_META: Record<PaymentType, BadgeMeta> = {
  [PAYMENT_TYPE.ADVANCE]: {
    label: "Advance Payment",
    badgeClass:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  [PAYMENT_TYPE.PARTIAL]: {
    label: "Partial Payment",
    badgeClass:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
  [PAYMENT_TYPE.BALANCE]: {
    label: "Remaining Balance",
    badgeClass:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  [PAYMENT_TYPE.WRITER_PAYOUT]: {
    label: "Writer Payout",
    badgeClass:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  [PAYMENT_TYPE.EXPENSE]: {
    label: "Operational Expense",
    badgeClass:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
};

export const INVOICE_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-amount", label: "Highest amount" },
  { value: "amount", label: "Lowest amount" },
];

export const PAYMENT_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-amount", label: "Highest amount" },
  { value: "amount", label: "Lowest amount" },
];
