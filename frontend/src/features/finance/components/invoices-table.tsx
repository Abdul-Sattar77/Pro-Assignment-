"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatMoney,
  INVOICE_STATUS_META,
  INVOICE_STATUS_OPTIONS,
} from "../constants";
import { useInvoiceAction, useInvoices } from "../hooks/use-finance";
import type { Invoice, InvoiceStatus } from "../types";
import { PaymentDialog } from "./payment-dialog";

const ALL = "all";

/** Invoice list with per-viewer row actions (pay / verify / cancel). */
export function InvoicesTable() {
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const [payFor, setPayFor] = useState<Invoice | null>(null);

  const { data, isPending, isError, refetch } = useInvoices({
    status: status === ALL ? undefined : (status as InvoiceStatus),
    page,
    perPage: 10,
  });
  const action = useInvoiceAction();
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-52"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {INVOICE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 4 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 5 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Couldn&apos;t load invoices.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data && data.invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <p className="text-sm font-medium">No invoices yet</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Invoices raised against orders appear here.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {data?.invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <p className="font-mono text-xs font-medium">
                    {invoice.number}
                  </p>
                  {invoice.description && (
                    <p className="text-muted-foreground text-xs">
                      {invoice.description}
                    </p>
                  )}
                  {invoice.client && (
                    <p className="text-muted-foreground text-xs">
                      {invoice.client}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-40 truncate text-sm">
                  {invoice.assignment?.title ?? "—"}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatMoney(invoice.amountCents, invoice.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      INVOICE_STATUS_META[invoice.status].className,
                    )}
                  >
                    {invoice.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {invoice.actions.includes("submit_payment") && (
                      <Button size="sm" onClick={() => setPayFor(invoice)}>
                        <CreditCard className="size-4" />
                        Pay
                      </Button>
                    )}
                    {invoice.actions.includes("verify") && (
                      <Button
                        size="sm"
                        onClick={() =>
                          action.mutate({ id: invoice.id, action: "verify" })
                        }
                        disabled={action.isPending}
                      >
                        <BadgeCheck className="size-4" />
                        Verify
                      </Button>
                    )}
                    {invoice.actions.includes("cancel") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Cancel invoice"
                        onClick={() =>
                          action.mutate({ id: invoice.id, action: "cancel" })
                        }
                        disabled={action.isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Ban className="size-4" />
                      </Button>
                    )}
                    {invoice.actions.length === 0 && (
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {invoice.createdAt
                          ? format(new Date(invoice.createdAt), "MMM d")
                          : ""}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <PaymentDialog invoice={payFor} onClose={() => setPayFor(null)} />
    </div>
  );
}
