/** WhatsApp Business inbox domain types — mirror the backend resources. */

export type WhatsAppDirection = "inbound" | "outbound";

export type WhatsAppMessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "sticker"
  | "location"
  | "contacts"
  | "template"
  | "system"
  | "unsupported";

export type WhatsAppStatus =
  "pending" | "sent" | "delivered" | "read" | "failed";

export interface WhatsAppPerson {
  id: string | null;
  name: string | null;
}

export interface WhatsAppAttachment {
  name: string | null;
  mime: string | null;
  size: number | null;
  url: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: WhatsAppDirection;
  type: WhatsAppMessageType;
  body: string | null;
  /** Outbound sits on the right of the thread, as in WhatsApp itself. */
  outbound: boolean;
  mine: boolean;
  /** The sales rep who sent it. Null for inbound — the customer wrote it. */
  sender: WhatsAppPerson | null;
  status: WhatsAppStatus;
  statusLabel: string;
  errorMessage: string | null;
  isTemplate: boolean;
  templateName: string | null;
  /**
   * Sent from the WhatsApp Business phone app (Coexistence), not the portal.
   * Such messages have no `sender` — the portal cannot know who tapped send.
   */
  viaBusinessApp: boolean;
  editedAt: string | null;
  attachment: WhatsAppAttachment | null;
  /** Hidden from the inbox by a rep. Only admins receive these rows. */
  deleted: boolean;
  deletedBy: WhatsAppPerson | null;
  deletedAt: string | null;
  createdAt: string | null;
  sentAt: string | null;
}

export interface WhatsAppConversation {
  id: string;
  waId: string;
  phone: string | null;
  name: string;
  profileName: string | null;
  assignedTo: WhatsAppPerson | null;
  portalUser: WhatsAppPerson | null;
  lastMessage: {
    type: WhatsAppMessageType;
    body: string | null;
    outbound: boolean;
    status: WhatsAppStatus;
    createdAt: string | null;
  } | null;
  unreadCount: number;
  isArchived: boolean;
  /** True while free-form replies are deliverable AND free of charge. */
  withinServiceWindow: boolean;
  serviceWindowExpiresAt: string | null;
  lastMessageAt: string | null;
  lastInboundAt: string | null;
}

/** What to send: text and/or one attachment. */
export interface SendWhatsAppPayload {
  body?: string;
  file?: File;
}

/** Broadcast payload from the WhatsAppMessageReceived event. */
export interface WhatsAppBroadcastMessage {
  id: string;
  conversationId: string | null;
  waId: string | null;
  contactName: string | null;
  direction: WhatsAppDirection;
  type: WhatsAppMessageType;
  body: string | null;
  status: WhatsAppStatus;
  sender: WhatsAppPerson | null;
  hasMedia: boolean;
  createdAt: string | null;
}

/** Broadcast payload from the WhatsAppMessageStatusUpdated event. */
export interface WhatsAppBroadcastStatus {
  id: string;
  conversationId: string | null;
  status: WhatsAppStatus;
  errorMessage: string | null;
}

export interface WhatsAppAuditEntry {
  id: string;
  logName: string;
  description: string;
  subjectType: string | null;
  subjectId: number | null;
  causer: { id: string; name: string; email: string } | null;
  properties: Record<string, unknown> | null;
  createdAt: string | null;
}
