export type LeadStatus = "new" | "approved" | "converted" | "rejected";
export type LeadPriority = "low" | "medium" | "high" | "urgent";

export interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  description: string;
  status: LeadStatus;
  priority: LeadPriority;
  budget?: string;
  deadline?: string;
  createdAt: string;
  assignmentId?: string;
}
