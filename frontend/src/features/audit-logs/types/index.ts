export interface ActivityLog {
  id: string;
  logName: string;
  description: string;
  subjectType: string;
  subjectId: number;
  causer: {
    id: string;
    name: string;
    email: string;
  } | null;
  properties: any;
  createdAt: string;
}

export interface AuditLogFilters {
  logName?: string;
  causerId?: string;
  search?: string;
  page?: number;
  perPage?: number;
}
