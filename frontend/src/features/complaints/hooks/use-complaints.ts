"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { COMPLAINTS_QUERY_KEYS } from "../constants";
import { complaintsService } from "../services/complaints-service";
import type { Complaint, ComplaintFilters, SubmitComplaintPayload, ResolveComplaintPayload } from "../types";

export function useComplaints(filters: ComplaintFilters) {
  return useQuery({
    queryKey: COMPLAINTS_QUERY_KEYS.list(filters),
    queryFn: () => complaintsService.list(filters),
    staleTime: 15 * 1000,
  });
}

export function useComplaint(id: string) {
  return useQuery<Complaint, ApiError>({
    queryKey: COMPLAINTS_QUERY_KEYS.detail(id),
    queryFn: () => complaintsService.get(id),
  });
}

export function useSubmitComplaint() {
  const queryClient = useQueryClient();

  return useMutation<Complaint, ApiError, SubmitComplaintPayload>({
    mutationFn: (payload) => complaintsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: COMPLAINTS_QUERY_KEYS.all,
      });
      toast.success("Complaint submitted successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to submit complaint."),
  });
}

export function useResolveComplaint(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Complaint, ApiError, ResolveComplaintPayload>({
    mutationFn: (payload) => complaintsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: COMPLAINTS_QUERY_KEYS.all,
      });
      toast.success("Complaint resolution state updated.");
    },
    onError: (error) => toast.error(error.message || "Failed to update complaint resolution."),
  });
}
