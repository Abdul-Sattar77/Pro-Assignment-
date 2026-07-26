/**
 * Centralized Application Currency Configuration & Formatting.
 * Ensures consistent currency symbol (PKR) and display across Finance,
 * Invoices, Reports, Dashboard, Analytics, Profile, and Exports.
 */
const defaultCode = process.env.NEXT_PUBLIC_APP_CURRENCY || "PKR";

export const APP_CURRENCY = {
  code: defaultCode,
  symbol: `${defaultCode} `,
  label: `${defaultCode}`,
};

/**
 * Formats a numeric value into standard currency display string.
 * Example: 13396 -> "PKR 13,396"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  _ignoredCurrency?: string, // Deprecated parameter, keeping for backwards compatibility with existing calls
): string {
  const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;

  const formatted = Math.abs(numericAmount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const sign = numericAmount < 0 ? "-" : "";
  const prefix = `${APP_CURRENCY.code} `;

  return `${sign}${prefix}${formatted}`;
}
