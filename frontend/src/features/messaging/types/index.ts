export type MessageRole = "pm" | "client" | "writer" | "admin";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageRole;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatar: string;
}
