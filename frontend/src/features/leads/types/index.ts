/**
 * Leads domain types — mirror the backend LeadResource contract.
 */
export const LEAD_STATUS = {
  NEW: "new",
  QUOTED: "quoted",
  NEGOTIATING: "negotiating",
  WON: "won",
  LOST: "lost",
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const LEAD_SOURCE = {
  INSTAGRAM: "instagram",
  WHATSAPP: "whatsapp",
  REFERRAL: "referral",
  OTHER: "other",
} as const;

export type LeadSource = (typeof LEAD_SOURCE)[keyof typeof LEAD_SOURCE];

export interface Lead {
  id: string; // uuid
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  sourceLabel: string;
  status: LeadStatus;
  statusLabel: string;
  notes: string | null;
  lostReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface LeadsPage {
  leads: Lead[];
  pagination: PaginationMeta;
}

export interface CreateLeadPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
  lostReason?: string | null;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
  lostReason?: string | null;
}

export interface LeadQuote {
  id: string;
  amount: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string | null;
}

export interface CreateLeadQuotePayload {
  amount: number;
  notes?: string | null;
}
