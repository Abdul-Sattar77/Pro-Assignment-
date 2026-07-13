"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { FINANCE_QUERY_KEYS } from "../constants";
import { financeService } from "../services/finance-service";
import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
  Payment,
  PaymentFilters,
  PaymentsPage,
  FinanceStats,
  RecordPaymentPayload,
  UpdateInvoicePayload,
  VerifyPaymentPayload,
} from "../types";

export function useInvoices(filters: InvoiceFilters) {
  return useQuery<InvoicesPage, ApiError>({
    queryKey: FINANCE_QUERY_KEYS.invoicesList(filters),
    queryFn: () => financeService.listInvoices(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice, ApiError>({
    queryKey: FINANCE_QUERY_KEYS.invoiceDetail(id),
    queryFn: () => financeService.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, ApiError, CreateInvoicePayload>({
    mutationFn: (payload) => financeService.createInvoice(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Invoice generated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to generate invoice."),
  });
}

export function useUpdateInvoice(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation<Invoice, ApiError, UpdateInvoicePayload>({
    mutationFn: (payload) => financeService.updateInvoice(invoiceId, payload),
    onSuccess: (invoice) => {
      queryClient.setQueryData(FINANCE_QUERY_KEYS.invoiceDetail(invoiceId), invoice);
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Invoice updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update invoice."),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => financeService.deleteInvoice(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Invoice deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete invoice."),
  });
}

export function usePayments(filters: PaymentFilters) {
  return useQuery<PaymentsPage, ApiError>({
    queryKey: FINANCE_QUERY_KEYS.paymentsList(filters),
    queryFn: () => financeService.listPayments(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function usePayment(id: string) {
  return useQuery<Payment, ApiError>({
    queryKey: FINANCE_QUERY_KEYS.paymentDetail(id),
    queryFn: () => financeService.getPayment(id),
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, RecordPaymentPayload>({
    mutationFn: (payload) => financeService.recordPayment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allPayments,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Payment recorded successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to record payment."),
  });
}

export function useVerifyPayment(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, VerifyPaymentPayload>({
    mutationFn: (payload) => financeService.verifyPayment(paymentId, payload),
    onSuccess: (payment) => {
      queryClient.setQueryData(FINANCE_QUERY_KEYS.paymentDetail(paymentId), payment);
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allPayments,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Payment status updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update payment status."),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => financeService.deletePayment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allPayments,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.allInvoices,
      });
      void queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.stats(),
      });
      toast.success("Payment transaction deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete payment transaction."),
  });
}

export function useFinanceStats() {
  return useQuery<FinanceStats, ApiError>({
    queryKey: FINANCE_QUERY_KEYS.stats(),
    queryFn: () => financeService.getStats(),
  });
}
