import { formatMoney } from "../constants";
import { invoiceClientName, type Invoice } from "../types";

/** Escape user-supplied strings before injecting into the print HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Open a clean, print-ready invoice in a new window and trigger the browser's
 * print dialog — from which the client can "Save as PDF". No server-side PDF
 * dependency required. Client-facing (gate the trigger with <Can role="client">).
 */
export function printInvoice(invoice: Invoice): void {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;

  const currency = invoice.currency;
  const date = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const due = invoice.dueAmountCents ?? invoice.amountCents;
  const paid = invoice.paidAmountCents ?? 0;

  const rows = [
    ["Amount", formatMoney(invoice.amountCents, currency)],
    ["Paid", formatMoney(paid, currency)],
    ["Balance due", formatMoney(due, currency)],
  ]
    .map(
      ([label, value]) =>
        `<tr><td class="label">${label}</td><td class="value">${esc(value)}</td></tr>`,
    )
    .join("");

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${esc(invoice.number)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #0f172a; margin: 0; padding: 48px; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #1e3a8a; }
  .muted { color: #64748b; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 28px; }
  h1 { font-size: 30px; margin: 0 0 4px; letter-spacing: -0.02em; }
  .meta { margin: 4px 0; font-size: 13px; }
  .section { margin: 24px 0; }
  .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  td.label { color: #64748b; }
  td.value { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
  tr:last-child td { border-bottom: none; font-size: 16px; font-weight: 800; padding-top: 16px; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #eff6ff; color: #1e3a8a; font-size: 12px; font-weight: 600; }
  .foot { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="brand">Prossignment</div>
      <div class="muted" style="font-size:12px;">Academic assignment management</div>
    </div>
    <div style="text-align:right;">
      <h1>Invoice</h1>
      <div class="meta"><strong>${esc(invoice.number)}</strong></div>
      <div class="meta muted">${esc(date)}</div>
      <div class="meta"><span class="status">${esc(invoice.statusLabel)}</span></div>
    </div>
  </div>

  ${
    invoice.client
      ? `<div class="section"><h2>Billed to</h2><div>${esc(invoiceClientName(invoice.client))}</div></div>`
      : ""
  }
  ${
    invoice.assignment
      ? `<div class="section"><h2>Assignment</h2><div>${esc(invoice.assignment.title)}</div></div>`
      : ""
  }
  ${
    invoice.description
      ? `<div class="section"><h2>Description</h2><div>${esc(invoice.description)}</div></div>`
      : ""
  }

  <div class="section">
    <h2>Summary</h2>
    <table>${rows}</table>
  </div>

  <div class="foot">Thank you. Generated from the Prossignment portal.</div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}
