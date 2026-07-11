"use client";

import {
  ConversationList,
  MessageList,
  MessageInput,
  useMessaging,
} from "@/features/messaging";

export default function MessagingPage() {
  const {
    conversations,
    activeConversation,
    activeMessages,
    activeConversationId,
    selectConversation,
    sendMessage,
  } = useMessaging();

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border">
      {/* Left — Conversation list */}
      <div className="bg-background w-72 shrink-0 border-r">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConversation}
        />
      </div>

      {/* Right — Chat window */}
      <div className="bg-background flex flex-1 flex-col">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="bg-background/80 border-b px-6 py-4 backdrop-blur-sm">
              <p className="text-sm font-semibold">
                {activeConversation.assignmentTitle}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {activeConversation.participants.join(" · ")}
              </p>
            </div>

            {/* Messages */}
            <MessageList messages={activeMessages} currentUserId="pm1" />

            {/* Input */}
            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
