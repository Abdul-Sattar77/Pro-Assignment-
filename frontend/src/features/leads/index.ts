/**
 * Public surface of the leads feature. Other code imports ONLY from
 * here (frontend-standards §8).
 */
export { LeadsTable } from "./components/leads-table";
export { LeadDetail } from "./components/lead-detail";
export { StatusBadge } from "./components/status-badge";
export { SourceBadge } from "./components/source-badge";
export { CreateLeadDialog } from "./components/create-lead-dialog";
export { EditLeadDialog } from "./components/edit-lead-dialog";
export {
  useLead,
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
} from "./hooks/use-leads";
export {
  LEAD_STATUS,
  LEAD_SOURCE,
  type Lead,
  type LeadStatus,
  type LeadSource,
  type LeadFilters,
  type CreateLeadPayload,
  type UpdateLeadPayload,
} from "./types";
