/** Direct (cross-role) chat domain types — mirror the backend chat resources. */

export type ChatRole = "admin" | "project_manager" | "writer" | "client";

export type ChatMessageType = "text" | "file" | "voice" | "image" | "video";

export interface ChatContact {
  id: string;
  name: string;
  role: ChatRole | null;
}

export interface ChatAttachment {
  name: string | null;
  mime: string | null;
  size: number | null;
  url: string;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  body: string | null;
  mine: boolean;
  sender: { id: string | null; name: string | null };
  attachment: ChatAttachment | null;
  createdAt: string | null;
}

export interface ChatConversation {
  id: string;
  contact: ChatContact | null;
  lastMessage: {
    type: ChatMessageType;
    body: string | null;
    mine: boolean;
    createdAt: string | null;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface ChatPolicy {
  roleA: ChatRole;
  roleB: ChatRole;
  allowed: boolean;
  locked: boolean;
}

/** What to send: text and/or one attachment. */
export interface SendMessagePayload {
  body?: string;
  file?: File;
}
