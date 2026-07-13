"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/animations/variants";
import {
  ConversationList,
  ChatWindow,
  MessageInput,
  useConversations,
  useChatHistory,
  useSendMessage,
  type Conversation,
} from "@/features/messaging";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");

  const { data: conversations, isPending: loadingList, refetch: refetchList } = useConversations(
    search.trim() || undefined
  );

  const { data: messages, isPending: loadingHistory, refetch: refetchHistory } = useChatHistory(
    selectedConversation?.id || null
  );

  const sendMessage = useSendMessage();

  const handleSendMessage = (messageText: string | null, attachmentId: string | null) => {
    if (!selectedConversation) return;

    sendMessage.mutate(
      {
        assignmentId: selectedConversation.assignment.id,
        type: selectedConversation.type,
        message: messageText,
        attachmentId,
      },
      {
        onSuccess: () => {
          void refetchHistory();
          void refetchList();
        },
      }
    );
  };

  const handleSelectConversation = (c: Conversation) => {
    setSelectedConversation(c);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-140px)] flex bg-card border rounded-xl overflow-hidden shadow-sm"
    >
      {/* Sidebar List (1/3 width) */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 h-full border-r">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          isLoading={loadingList}
        />
      </div>

      {/* Main Chat Window (2/3 width) */}
      <div className="flex-1 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/10">
        {selectedConversation ? (
          <>
            {/* Header / Top actions */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages || []}
                isLoading={loadingHistory}
              />

              {/* Message Input bar */}
              <MessageInput
                assignmentId={selectedConversation.assignment.id}
                onSend={handleSendMessage}
                isSending={sendMessage.isPending}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div variants={fadeIn} className="max-w-xs space-y-3">
              <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquareOff className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold">Select a conversation</h3>
              <p className="text-xs text-muted-foreground">
                Choose a workflow channel from the list on the left to review messages and coordinate assignments.
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
  );
}
