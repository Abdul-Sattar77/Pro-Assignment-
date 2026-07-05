import { apiClient, ensureCsrfCookie } from "@/lib/api-client";
import type {
  Assignment,
  AssignmentAction,
  AssignmentFilters,
  AssignmentsPage,
  CreateAssignmentPayload,
  PaginationMeta,
} from "../types";

interface ListEnvelope {
  data: Assignment[];
  meta: { pagination: PaginationMeta };
}

interface ItemEnvelope {
  data: Assignment;
}

/** Workflow action key → API sub-path (api-standards §11 verbs). */
const ACTION_PATHS: Record<AssignmentAction, string> = {
  assign: "assign",
  accept: "accept",
  reject: "reject",
  submit: "submit",
  return: "return",
  deliver: "deliver",
  request_revision: "request-revision",
  complete: "complete",
  cancel: "cancel",
};

/** Typed API calls for assignments (/api/v1/assignments). */
export const assignmentsService = {
  async list(filters: AssignmentFilters): Promise<AssignmentsPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;

    const { data } = await apiClient.get<ListEnvelope>("/assignments", {
      params,
    });
    return { assignments: data.data, pagination: data.meta.pagination };
  },

  async get(id: string): Promise<Assignment> {
    const { data } = await apiClient.get<ItemEnvelope>(`/assignments/${id}`);
    return data.data;
  },

  async create(payload: CreateAssignmentPayload): Promise<Assignment> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      "/assignments",
      payload,
    );
    return data.data;
  },

  /** Assign a writer (PM). */
  async assign(id: string, writerId: string): Promise<Assignment> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${id}/assign`,
      { writerId },
    );
    return data.data;
  },

  /**
   * Any note-style workflow action (deliver/return/cancel/submit/…).
   * The backend validates the actor + state; unknown-to-you actions still
   * work here — add UI for them via ACTION_CONFIG (see assignment-actions).
   */
  async act(
    id: string,
    action: Exclude<AssignmentAction, "assign">,
    note?: string,
  ): Promise<Assignment> {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${id}/${ACTION_PATHS[action]}`,
      note ? { note } : {},
    );
    return data.data;
  },
};
