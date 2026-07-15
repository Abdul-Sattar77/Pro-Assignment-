import { useState } from "react";
import type { Message, Conversation } from "../types";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    assignmentId: "A-101",
    assignmentTitle: "Assignment #A-101 — Essay Writing",
    participants: ["Project Manager", "John Client"],
    lastMessage: "Please review the submitted draft.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    avatar: "JC",
  },
  {
    id: "c2",
    assignmentId: "A-102",
    assignmentTitle: "Assignment #A-102 — Research Paper",
    participants: ["Project Manager", "Sara Writer"],
    lastMessage: "I have started working on the outline.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unreadCount: 0,
    avatar: "SW",
  },
  {
    id: "c3",
    assignmentId: "A-103",
    assignmentTitle: "Assignment #A-103 — Case Study",
    participants: ["Project Manager", "Mike Client"],
    lastMessage: "When will the first draft be ready?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadCount: 1,
    avatar: "MC",
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      senderId: "client1",
      senderName: "John Client",
      senderRole: "client",
      content: "Hi, I wanted to check on the progress of my assignment.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
    },
    {
      id: "m2",
      conversationId: "c1",
      senderId: "pm1",
      senderName: "Project Manager",
      senderRole: "pm",
      content:
        "Hello John! Your assignment is in progress. Our writer has started working on it.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
    },
    {
      id: "m3",
      conversationId: "c1",
      senderId: "client1",
      senderName: "John Client",
      senderRole: "client",
      content: "Great! When can I expect the first draft?",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: true,
    },
    {
      id: "m4",
      conversationId: "c1",
      senderId: "client1",
      senderName: "John Client",
      senderRole: "client",
      content: "Please review the submitted draft.",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
    },
  ],
  c2: [
    {
      id: "m5",
      conversationId: "c2",
      senderId: "pm1",
      senderName: "Project Manager",
      senderRole: "pm",
      content:
        "Sara, you have been assigned to Research Paper #A-102. Please review the requirements.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: true,
    },
    {
      id: "m6",
      conversationId: "c2",
      senderId: "writer1",
      senderName: "Sara Writer",
      senderRole: "writer",
      content:
        "Got it! I have reviewed the requirements. I have started working on the outline.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
    },
  ],
  c3: [
    {
      id: "m7",
      conversationId: "c3",
      senderId: "client2",
      senderName: "Mike Client",
      senderRole: "client",
      content: "Hello, I placed an order for a case study. Can you confirm?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isRead: true,
    },
    {
      id: "m8",
      conversationId: "c3",
      senderId: "pm1",
      senderName: "Project Manager",
      senderRole: "pm",
      content:
        "Hi Mike! Yes, we have received your order. We are assigning a writer shortly.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isRead: true,
    },
    {
      id: "m9",
      conversationId: "c3",
      senderId: "client2",
      senderName: "Mike Client",
      senderRole: "client",
      content: "When will the first draft be ready?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isRead: false,
    },
  ],
};

export function useMessaging() {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("c1");

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;
  const activeMessages = activeConversationId
    ? (messages[activeConversationId] ?? [])
    : [];

  function selectConversation(id: string) {
    setActiveConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  }

  function sendMessage(content: string) {
    if (!activeConversationId || !content.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      conversationId: activeConversationId,
      senderId: "pm1",
      senderName: "Project Manager",
      senderRole: "pm",
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] ?? []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: content.trim(),
              lastMessageAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  return {
    conversations,
    activeConversation,
    activeMessages,
    activeConversationId,
    selectConversation,
    sendMessage,
  };
}
