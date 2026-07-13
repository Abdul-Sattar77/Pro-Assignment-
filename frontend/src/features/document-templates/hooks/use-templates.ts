"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/http-error";
import { TEMPLATES_QUERY_KEYS } from "../constants";
import { templatesService } from "../services/templates-service";
import type { DocumentTemplate, TemplateFilters, CreateTemplatePayload } from "../types";

export function useTemplates(filters: TemplateFilters) {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEYS.list(filters),
    queryFn: () => templatesService.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<DocumentTemplate, ApiError, CreateTemplatePayload>({
    mutationFn: (payload) => templatesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TEMPLATES_QUERY_KEYS.all,
      });
      toast.success("Document template added successfully.");
    },
    onError: (error) => toast.error(error.message || "Failed to add template."),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => templatesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TEMPLATES_QUERY_KEYS.all,
      });
      toast.success("Document template deleted.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete template."),
  });
}
