export const MESSAGING_QUERY_KEYS = {
  all: ["messaging"] as const,
  conversations: (search?: string, type?: string) => ["messaging", "conversations", { search, type }] as const,
  history: (conversationId: string) => ["messaging", "history", conversationId] as const,
  unreadCount: () => ["messaging", "unread-count"] as const,
};
