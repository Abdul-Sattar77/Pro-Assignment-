/**
 * Centralized Application Currency Configuration & Formatting.
 * Ensures consistent currency symbol (PKR) and display across Finance,
 * Invoices, Reports, Dashboard, Analytics, Profile, and Exports.
 */
export const APP_CURRENCY = {
  code: "PKR",
  symbol: "PKR ",
  label: "Pakistani Rupee (PKR)",
};

/**
 * Formats a numeric value into standard currency display string.
 * Example: 13396 -> "PKR 13,396"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = APP_CURRENCY.code,
): string {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount) || 0;

  const formatted = Math.abs(numericAmount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const sign = numericAmount < 0 ? "-" : "";
  // Standardize currency to PKR across all finance modules, invoices, and reports
  const displayCurrency =
    !currency || currency === "USD" ? APP_CURRENCY.code : currency;
  const prefix = `${displayCurrency} `;

  return `${sign}${prefix}${formatted}`;
}
