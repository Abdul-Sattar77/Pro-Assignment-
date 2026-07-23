"use client";

import { useState } from "react";
import { Loader2, MessageSquare, PenSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatThread,
  ContactPicker,
  ConversationList,
  roleLabel,
  useChatContacts,
  useConversations,
  useStartConversation,
  type ChatContact,
  type ChatConversation,
} from "@/features/chat";

interface Active {
  id: string;
  name: string;
  role: ChatContact["role"];
}

/**
 * Full-page Messages — the same real-time direct chat the floating widget uses
 * (backed by the wired /chat endpoints). Two panes: conversations on the left,
 * the open thread on the right, plus a "new message" contact picker.
 */
export default function MessagesPage() {
  const { data: conversations = [], isPending } = useConversations();
  const { data: contacts = [] } = useChatContacts();
  const startConversation = useStartConversation();

  const [active, setActive] = useState<Active | null>(null);
  const [picking, setPicking] = useState(false);

  const openConversation = (c: ChatConversation) => {
    setActive({
      id: c.id,
      name: c.contact?.name ?? "Chat",
      role: c.contact?.role ?? null,
    });
    setPicking(false);
  };

  const openContact = (contact: ChatContact) => {
    startConversation.mutate(contact.id, {
      onSuccess: (conversation) => {
        setActive({
          id: conversation.id,
          name: contact.name,
          role: contact.role,
        });
        setPicking(false);
      },
    });
  };

  return (
    <div className="bg-card flex h-[calc(100dvh-9rem)] overflow-hidden rounded-xl border shadow-sm">
      {/* Left: conversations */}
      <div className="flex h-full w-full shrink-0 flex-col border-r sm:w-80 lg:w-96">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="text-primary size-4" />
            {picking ? "New message" : "Messages"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={picking ? "Back to conversations" : "New message"}
            onClick={() => setPicking((p) => !p)}
          >
            {picking ? (
              <X className="size-4" />
            ) : (
              <PenSquare className="size-4" />
            )}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {picking ? (
            startConversation.isPending ? (
              <div className="text-muted-foreground flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : (
              <ContactPicker contacts={contacts} onPick={openContact} />
            )
          ) : isPending ? (
            <div className="text-muted-foreground flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              onSelect={openConversation}
            />
          )}
        </div>
      </div>

      {/* Right: open thread */}
      <div className="hidden min-w-0 flex-1 flex-col sm:flex">
        {active ? (
          <>
            <div className="border-b px-5 py-3">
              <p className="truncate text-sm font-semibold">{active.name}</p>
              {active.role && (
                <p className="text-muted-foreground text-xs">
                  {roleLabel(active.role)}
                </p>
              )}
            </div>
            <div className="min-h-0 flex-1">
              <ChatThread conversationId={active.id} />
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full">
              <MessageSquare className="size-6" />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Select a conversation
              </p>
              <p className="mt-1 text-xs">
                Pick a chat on the left, or start a new one with the ✏️ button.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
