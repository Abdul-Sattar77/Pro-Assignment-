export interface Complaint {
  id: string;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignment: {
    id: string;
    title: string;
  } | null;
  projectManager: {
    id: string;
    name: string;
  } | null;
  writer?: {
    id: string;
    name: string;
  } | null;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "dismissed";
  resolution: string | null;
  resolvedAt: string | null;
  resolverName: string | null;
  createdAt: string;
}

export interface ComplaintFilters {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface SubmitComplaintPayload {
  assignmentId?: string | null;
  subject: string;
  description: string;
}

export interface ResolveComplaintPayload {
  status: "resolved" | "dismissed" | "in_progress";
  resolution?: string;
  projectManagerId?: string | null;
  writerId?: string | null;
}
