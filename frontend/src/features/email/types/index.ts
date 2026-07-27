/** Shared email inbox domain types — mirror the backend resources. */

export type EmailDirection = "inbound" | "outbound";

export type EmailStatus = "received" | "queued" | "sent" | "failed";

export interface EmailPerson {
  id: string | null;
  name: string | null;
}

export interface EmailAddress {
  email: string | null;
  name: string | null;
}

export interface EmailAttachment {
  id: string;
  name: string | null;
  mime: string | null;
  size: number | null;
  /** False when only metadata was kept (oversized, or the mirror failed). */
  stored: boolean;
  url: string;
}

export interface EmailMessage {
  id: string;
  direction: EmailDirection;
  outbound: boolean;
  mine: boolean;
  subject: string | null;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  /** The rep who sent it. Null for inbound and for mail sent from Gmail. */
  sender: EmailPerson | null;
  /** True when sent from Gmail rather than the portal — no rep attribution. */
  viaMailClient: boolean;
  status: EmailStatus;
  statusLabel: string;
  errorMessage: string | null;
  attachments: EmailAttachment[];
  /** Hidden from the inbox by a rep. Only admins receive these rows. */
  deleted: boolean;
  deletedBy: EmailPerson | null;
  deletedAt: string | null;
  sentAt: string | null;
  createdAt: string | null;
}

export interface EmailThread {
  id: string;
  subject: string;
  contact: EmailAddress;
  assignedTo: EmailPerson | null;
  portalUser: EmailPerson | null;
  lastMessage: {
    snippet: string | null;
    outbound: boolean;
    status: EmailStatus;
    fromName: string | null;
    createdAt: string | null;
  } | null;
  messageCount: number;
  unreadCount: number;
  isArchived: boolean;
  lastMessageAt: string | null;
  lastInboundAt: string | null;
}

/** Mailbox health, surfaced alongside the thread list. */
export interface EmailInboxMeta {
  configured: boolean;
  mailbox: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface SendEmailPayload {
  body: string;
  files?: File[];
}

/** Broadcast payload from EmailMessageReceived. */
export interface EmailBroadcastMessage {
  id: string;
  threadId: string | null;
  subject: string | null;
  snippet: string | null;
  direction: EmailDirection;
  status: EmailStatus;
  fromEmail: string | null;
  fromName: string | null;
  sender: EmailPerson | null;
  createdAt: string | null;
}

export interface EmailAuditEntry {
  id: string;
  logName: string;
  description: string;
  causer: { id: string; name: string; email: string } | null;
  properties: Record<string, unknown> | null;
  createdAt: string | null;
}
