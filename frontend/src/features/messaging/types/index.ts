export interface ConversationAssignment {
  id: string; // uuid
  title: string;
  status: string;
}

export interface ConversationLatestMessage {
  id: string; // uuid
  message: string;
  messageType: "text" | "file" | "image";
  createdAt: string;
  sender: {
    name: string;
    email: string;
  };
}

export interface Conversation {
  id: string; // uuid
  type: "client" | "writer";
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  assignment: ConversationAssignment;
  latestMessage?: ConversationLatestMessage | null;
}

export interface MessageSender {
  id: string; // uuid
  name: string;
  email: string;
}

export interface MessageAttachment {
  id: string; // uuid
  originalName: string;
  size: number;
  humanSize: string;
  mimeType: string;
  downloadUrl: string;
}

export interface Message {
  id: string; // uuid
  message: string;
  messageType: "text" | "file" | "image";
  isDeleted: boolean;
  createdAt: string;
  sender?: MessageSender | null;
  attachment?: MessageAttachment | null;
}

export interface SendMessagePayload {
  assignmentId: string; // uuid
  type: "client" | "writer";
  message?: string | null;
  attachmentId?: string | null;
}
