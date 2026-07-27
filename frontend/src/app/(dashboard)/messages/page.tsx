"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareOff, Plus, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/animations/variants";
import {
  useConversations,
  useChatContacts,
  useStartConversation,
} from "@/features/chat/hooks/use-chat";
import { ChatThread } from "@/features/chat/components/chat-thread";
import {
  ConversationList,
  ContactPicker,
} from "@/features/chat/components/conversation-list";
import type { ChatConversation, ChatContact } from "@/features/chat/types";
import { useCurrentUser } from "@/features/auth";
import { DeletedMessagesList } from "@/features/messaging/components/deleted-messages-list";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mode, setMode] = useState<"conversations" | "contacts">(
    "conversations",
  );

  const {
    data: conversations = [],
    isPending: loadingList,
    refetch: refetchList,
  } = useConversations();

  const { data: contacts = [], isPending: loadingContacts } = useChatContacts();
  const startConversation = useStartConversation();
  const { data: currentUser } = useCurrentUser();
  const isAdmin = Boolean(currentUser?.roles?.includes("admin"));

  const handleSelectConversation = (c: ChatConversation) => {
    setSelectedConversation({
      id: c.id,
      name: c.contact?.name ?? "Chat",
    });
  };

  const handlePickContact = (contact: ChatContact) => {
    startConversation.mutate(contact.id, {
      onSuccess: (conv) => {
        setSelectedConversation({
          id: conv.id,
          name: contact.name,
        });
        setMode("conversations");
      },
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Chat Panel */}
      <motion.div
        variants={fadeIn}
        className="bg-card flex h-[calc(100vh-140px)] overflow-hidden rounded-xl border shadow-xs"
      >
        {/* Sidebar List (1/3 width) */}
        <div className="flex h-full w-full shrink-0 flex-col border-r md:w-80 lg:w-96">
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {mode === "conversations" ? "Conversations" : "Start New Chat"}
            </span>
            {mode === "conversations" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("contacts")}
                className="h-7 gap-1 text-xs"
              >
                <UserPlus className="size-3.5" />
                New Chat
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("conversations")}
                className="h-7 text-xs"
              >
                Back to chats
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {mode === "conversations" ? (
              <ConversationList
                conversations={conversations}
                onSelect={handleSelectConversation}
              />
            ) : (
              <ContactPicker contacts={contacts} onPick={handlePickContact} />
            )}
          </div>
        </div>

        {/* Main Chat Window (2/3 width) */}
        <div className="flex h-full flex-1 flex-col bg-zinc-50/50 dark:bg-zinc-950/10">
          {selectedConversation ? (
            <div className="flex h-full flex-1 flex-col overflow-hidden">
              <div className="bg-card border-b px-4 py-3">
                <h3 className="text-sm font-semibold">
                  {selectedConversation.name}
                </h3>
              </div>
              <ChatThread conversationId={selectedConversation.id} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <motion.div variants={fadeIn} className="max-w-xs space-y-3">
                <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
                  <MessageSquareOff className="text-muted-foreground size-6" />
                </div>
                <h3 className="text-sm font-bold">Select a conversation</h3>
                <p className="text-muted-foreground text-xs">
                  Choose a workflow channel from the list on the left to review
                  messages and coordinate assignments.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void refetchList();
                  }}
                  className="gap-1 px-3 text-xs"
                >
                  <RefreshCw className="size-3.5" />
                  Refresh Chats
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Deleted Messages Audit — Admin Only */}
      {isAdmin && (
        <motion.div variants={fadeIn}>
          <DeletedMessagesList />
        </motion.div>
      )}
    </motion.div>
  );
}
