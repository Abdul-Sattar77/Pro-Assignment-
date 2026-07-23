"use client";

import { useState } from "react";
import { usePayments, useDeletePayment } from "../hooks/use-finance";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { VerifyPaymentDialog } from "./verify-payment-dialog";
import {
  PAYMENT_STATUS_META,
  PAYMENT_TYPE_META,
  PAYMENT_SORT_OPTIONS,
} from "../constants";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type Payment,
  type PaymentStatus,
  type PaymentType,
} from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  ShieldCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/features/auth";
import { formatCurrency } from "@/config/currency";

export function PaymentsList() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [type, setType] = useState<PaymentType | "all">("all");
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);

  const [openRecord, setOpenRecord] = useState(false);
  const [openVerify, setOpenVerify] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );

  const filters = {
    status: status === "all" ? undefined : status,
    paymentType: type === "all" ? undefined : type,
    sort,
    page,
    perPage: 15,
  };

  const { data, isLoading } = usePayments(filters);
  const deletePayment = useDeletePayment();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment log?")) {
      deletePayment.mutate(id);
    }
  };

  const triggerVerification = (id: string) => {
    setSelectedPaymentId(id);
    setOpenVerify(true);
  };

  const payments = data?.payments || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val as PaymentStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(PAYMENT_STATUS_META).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={type}
            onValueChange={(val) => {
              setType(val as PaymentType | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(PAYMENT_TYPE_META).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(val) => {
              setSort(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setOpenRecord(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Transaction
        </Button>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Proof File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Loading transactions...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {payment.createdAt
                      ? format(
                          new Date(payment.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        PAYMENT_TYPE_META[payment.paymentType].badgeClass
                      }
                    >
                      {PAYMENT_TYPE_META[payment.paymentType].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{payment.user?.name || "N/A"}</TableCell>
                  <TableCell className="font-mono text-xs capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {payment.proofFile ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${payment.proofFile.downloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary flex items-center gap-1 text-xs hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Proof</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No proof
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={PAYMENT_STATUS_META[payment.status].badgeClass}
                    >
                      {PAYMENT_STATUS_META[payment.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && payment.status === PAYMENT_STATUS.PENDING && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => triggerVerification(payment.id)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(payment.id)}
                          disabled={deletePayment.isPending}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-muted-foreground text-xs">
            Showing Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total items)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <RecordPaymentDialog open={openRecord} onOpenChange={setOpenRecord} />

      {openVerify && selectedPaymentId && (
        <VerifyPaymentDialog
          paymentId={selectedPaymentId}
          open={openVerify}
          onOpenChange={setOpenVerify}
        />
      )}
    </div>
  );
}
