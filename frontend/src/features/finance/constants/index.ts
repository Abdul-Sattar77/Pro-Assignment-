import type { InvoiceStatus } from "../types";

/** cents → localized currency string. */
export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Awaiting payment",
    className: "text-amber-600 dark:text-amber-400",
  },
  awaiting_verification: {
    label: "Verifying payment",
    className: "text-violet-600 dark:text-violet-400",
  },
  paid: {
    label: "Paid",
    className: "text-emerald-600 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-muted-foreground",
  },
};

export const INVOICE_STATUS_OPTIONS = Object.entries(INVOICE_STATUS_META).map(
  ([value, meta]) => ({ value: value as InvoiceStatus, label: meta.label }),
);
