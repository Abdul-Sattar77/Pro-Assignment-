"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/http-error";
import { financeService } from "../services/finance-service";
import type {
  CreateInvoicePayload,
  FinanceStats,
  FinanceSummary,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
  Payment,
  PaymentFilters,
  PaymentsPage,
  RecordPaymentPayload,
  VerifyPaymentPayload,
} from "../types";

const KEYS = {
  all: ["invoices"] as const,
  list: (filters: InvoiceFilters) => ["invoices", "list", filters] as const,
  summary: ["invoices", "summary"] as const,
  allPayments: ["payments"] as const,
  paymentsList: (filters: PaymentFilters) =>
    ["payments", "list", filters] as const,
  stats: ["finance", "stats"] as const,
};

function invalidatePayments(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: KEYS.allPayments });
  void queryClient.invalidateQueries({ queryKey: KEYS.stats });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: KEYS.all });
}

export function useInvoices(filters: InvoiceFilters) {
  return useQuery<InvoicesPage, ApiError>({
    queryKey: KEYS.list(filters),
    queryFn: () => financeService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useFinanceSummary() {
  return useQuery<FinanceSummary, ApiError>({
    queryKey: KEYS.summary,
    queryFn: () => financeService.summary(),
    staleTime: 15 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation<Invoice, ApiError, CreateInvoicePayload>({
    mutationFn: (payload) => financeService.create(payload),
    onSuccess: (invoice) => {
      invalidate(queryClient);
      toast.success(`Invoice ${invoice.number} created.`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation<Invoice, ApiError, { id: string; reference: string }>({
    mutationFn: ({ id, reference }) =>
      financeService.submitPayment(id, reference),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Payment submitted — awaiting verification.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useInvoiceAction() {
  const queryClient = useQueryClient();
  return useMutation<
    Invoice,
    ApiError,
    { id: string; action: "verify" | "cancel" }
  >({
    mutationFn: ({ id, action }) =>
      action === "verify"
        ? financeService.verify(id)
        : financeService.cancel(id),
    onSuccess: (invoice) => {
      invalidate(queryClient);
      toast.success(invoice.statusLabel);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => financeService.deleteInvoice(id),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Invoice deleted.");
    },
    onError: (error) => toast.error(error.message),
  });
}

// ---- Payments subsystem (admin panel) ----
export function usePayments(filters: PaymentFilters) {
  return useQuery<PaymentsPage, ApiError>({
    queryKey: KEYS.paymentsList(filters),
    queryFn: () => financeService.listPayments(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation<Payment, ApiError, RecordPaymentPayload>({
    mutationFn: (payload) => financeService.recordPayment(payload),
    onSuccess: () => {
      invalidatePayments(queryClient);
      toast.success("Payment recorded.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useVerifyPayment(paymentId: string) {
  const queryClient = useQueryClient();
  return useMutation<Payment, ApiError, VerifyPaymentPayload>({
    mutationFn: (payload) => financeService.verifyPayment(paymentId, payload),
    onSuccess: (payment) => {
      invalidatePayments(queryClient);
      toast.success(payment.statusLabel);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => financeService.deletePayment(id),
    onSuccess: () => {
      invalidatePayments(queryClient);
      toast.success("Payment deleted.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useFinanceStats() {
  return useQuery<FinanceStats, ApiError>({
    queryKey: KEYS.stats,
    queryFn: () => financeService.getStats(),
    staleTime: 30 * 1000,
  });
}

export function usePaymentReminders() {
  return useQuery<import("../types").PaymentReminder[], ApiError>({
    queryKey: ["finance", "reminders"],
    queryFn: () => financeService.listReminders(),
    staleTime: 30 * 1000,
  });
}

export function useSendReminder() {
  const queryClient = useQueryClient();
  return useMutation<
    import("../types").PaymentReminder,
    ApiError,
    { invoiceId: string; notes?: string }
  >({
    mutationFn: ({ invoiceId, notes }) =>
      financeService.sendReminder(invoiceId, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["finance", "reminders"],
      });
      toast.success("Payment reminder sent.");
    },
    onError: (error) =>
      toast.error(error.message || "Failed to send reminder."),
  });
}
