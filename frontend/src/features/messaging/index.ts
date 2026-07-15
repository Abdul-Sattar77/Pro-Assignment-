/**
 * Public surface of the messaging feature.
 */
export { ConversationList } from "./components/conversation-list";
export { ChatWindow } from "./components/chat-window";
export { MessageInput } from "./components/message-input";
export {
  useConversations,
  useChatHistory,
  useSendMessage,
  useDeleteMessage,
  useUnreadCount,
} from "./hooks/use-messaging";
export {
  type Conversation,
  type Message,
  type SendMessagePayload,
} from "./types";
export { MESSAGING_QUERY_KEYS } from "./constants";
