/** Public surface of the direct-messaging (chat) feature. */
export { ChatWidget } from "./components/chat-widget";
export { CallProvider, useCall } from "./call/call-provider";
export { PolicyMatrix } from "./components/policy-matrix";
export { AdminChatOversight } from "./components/admin-oversight";
export { ChatThread } from "./components/chat-thread";
export {
  ConversationList,
  ContactPicker,
  roleLabel,
} from "./components/conversation-list";
export {
  useConversations,
  useChatContacts,
  useStartConversation,
} from "./hooks/use-chat";
export type { ChatConversation, ChatMessage, ChatContact } from "./types";
