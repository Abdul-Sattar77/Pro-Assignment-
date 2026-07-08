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
  FinanceSummary,
  Invoice,
  InvoiceFilters,
  InvoicesPage,
} from "../types";

const KEYS = {
  all: ["invoices"] as const,
  list: (filters: InvoiceFilters) => ["invoices", "list", filters] as const,
  summary: ["invoices", "summary"] as const,
};

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
