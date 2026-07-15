import { apiClient } from "@/lib/api-client";
import type {
  AdminAssignmentFilters,
  Assignment,
  AssignmentAction,
  AssignmentAttachment,
  AssignmentFilters,
  AssignmentsPage,
  CreateAssignmentPayload,
  PaginationMeta,
  UpdateAssignmentPayload,
} from "../types";

interface ListEnvelope {
  data: Assignment[];
  meta: { pagination: PaginationMeta };
}

interface ItemEnvelope {
  data: Assignment;
}

interface AttachmentListEnvelope {
  data: AssignmentAttachment[];
}

interface AttachmentItemEnvelope {
  data: AssignmentAttachment;
}

/** Workflow action key → API sub-path (api-standards §11 verbs). */
const ACTION_PATHS: Record<AssignmentAction, string> = {
  assign: "assign",
  assign_manager: "assign-manager",
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
  async list(
    filters: AssignmentFilters | AdminAssignmentFilters,
  ): Promise<AssignmentsPage> {
    const params: Record<string, string | number> = {};
    if (filters.status) params["filter[status]"] = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.per_page = filters.perPage;

    const adminFilters = filters as AdminAssignmentFilters;
    if (adminFilters.priority)
      params["filter[priority]"] = adminFilters.priority;
    if (adminFilters.writerId) params["filter[writer]"] = adminFilters.writerId;
    if (adminFilters.projectManagerId)
      params["filter[project_manager]"] = adminFilters.projectManagerId;
    if (adminFilters.deadlineFrom)
      params["filter[deadline_from]"] = adminFilters.deadlineFrom;
    if (adminFilters.deadlineTo)
      params["filter[deadline_to]"] = adminFilters.deadlineTo;
    if (adminFilters.sort) params.sort = adminFilters.sort;

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
    const { data } = await apiClient.post<ItemEnvelope>(
      "/assignments",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: UpdateAssignmentPayload,
  ): Promise<Assignment> {
    const { data } = await apiClient.patch<ItemEnvelope>(
      `/assignments/${id}`,
      payload,
    );
    return data.data;
  },

  /** Assign a writer (PM/Admin). */
  async assign(id: string, writerId: string): Promise<Assignment> {
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${id}/assign`,
      { writerId },
    );
    return data.data;
  },

  /** Assign a project manager (Admin). */
  async assignManager(id: string, managerId: string): Promise<Assignment> {
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${id}/assign-manager`,
      { managerId },
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
    action: Exclude<AssignmentAction, "assign" | "assign_manager">,
    note?: string,
  ): Promise<Assignment> {
    const { data } = await apiClient.post<ItemEnvelope>(
      `/assignments/${id}/${ACTION_PATHS[action]}`,
      note ? { note } : {},
    );
    return data.data;
  },

  // ---- Attachment API ----

  async listAttachments(id: string): Promise<AssignmentAttachment[]> {
    const { data } = await apiClient.get<AttachmentListEnvelope>(
      `/assignments/${id}/attachments`,
    );
    return data.data;
  },

  async uploadAttachment(
    id: string,
    file: File,
    type: "file" | "voice_note",
  ): Promise<AssignmentAttachment> {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const { data } = await apiClient.post<AttachmentItemEnvelope>(
      `/assignments/${id}/attachments`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  async deleteAttachment(id: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}/attachments/${attachmentId}`);
  },

  /** Download URL for an attachment (served by the backend). */
  attachmentDownloadUrl(id: string, attachmentId: string): string {
    return `/api/v1/assignments/${id}/attachments/${attachmentId}/download`;
  },
};
