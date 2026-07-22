"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { LEADS_QUERY_KEYS } from "../constants";
import { leadsService } from "../services/leads-service";
import type {
  CreateLeadPayload,
  Lead,
  LeadFilters,
  LeadsPage,
  UpdateLeadPayload,
} from "../types";

export function useLeads(filters: LeadFilters) {
  return useQuery<LeadsPage, ApiError>({
    queryKey: LEADS_QUERY_KEYS.list(filters),
    queryFn: () => leadsService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useLead(id: string) {
  return useQuery<Lead, ApiError>({
    queryKey: LEADS_QUERY_KEYS.detail(id),
    queryFn: () => leadsService.get(id),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, ApiError, CreateLeadPayload>({
    mutationFn: (payload) => leadsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: LEADS_QUERY_KEYS.all,
      });
      toast.success("Lead created successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to create lead."),
  });
}

export function useUpdateLead(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation<Lead, ApiError, UpdateLeadPayload>({
    mutationFn: (payload) => leadsService.update(leadId, payload),
    onSuccess: (lead) => {
      queryClient.setQueryData(LEADS_QUERY_KEYS.detail(leadId), lead);
      void queryClient.invalidateQueries({
        queryKey: LEADS_QUERY_KEYS.all,
      });
      toast.success("Lead updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to update lead."),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => leadsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: LEADS_QUERY_KEYS.all,
      });
      toast.success("Lead deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete lead."),
  });
}

export function useLeadQuotes(leadId: string) {
  return useQuery<import("../types").LeadQuote[], ApiError>({
    queryKey: [...LEADS_QUERY_KEYS.detail(leadId), "quotes"],
    queryFn: () => leadsService.listQuotes(leadId),
  });
}

export function useCreateLeadQuote(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation<import("../types").LeadQuote, ApiError, import("../types").CreateLeadQuotePayload>({
    mutationFn: (payload) => leadsService.createQuote(leadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...LEADS_QUERY_KEYS.detail(leadId), "quotes"],
      });
      void queryClient.invalidateQueries({
        queryKey: LEADS_QUERY_KEYS.all,
      });
      toast.success("Quote added to history.");
    },
    onError: (error) => toast.error(error.message || "Failed to add quote."),
  });
}
