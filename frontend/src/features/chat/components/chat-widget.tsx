"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  PenSquare,
  Phone,
  Settings2,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth";
import { useCall } from "../call/call-provider";
import {
  useChatContacts,
  useConversations,
  useStartConversation,
} from "../hooks/use-chat";
import type { ChatContact, ChatConversation } from "../types";
import { ChatThread } from "./chat-thread";
import {
  ContactPicker,
  ConversationList,
  roleLabel,
} from "./conversation-list";

type View = "list" | "contacts" | "thread";
interface Active {
  id: string;
  name: string;
  role: ChatContact["role"];
}

/**
 * Floating chat launcher + panel, available to every signed-in role on every
 * page. Bottom-right. Polls conversations for unread counts.
 */
export function ChatWidget() {
  const { data: user } = useCurrentUser();
  const call = useCall();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [active, setActive] = useState<Active | null>(null);

  // Enabled whenever logged in (not just when open) so the 8s poll keeps the
  // unread badge fresh on the closed launcher.
  const { data: conversations = [], isPending } = useConversations(
    Boolean(user),
  );
  const { data: contacts = [] } = useChatContacts();
  const startConversation = useStartConversation();

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  if (!user) return null;

  const openConversation = (c: ChatConversation) => {
    setActive({
      id: c.id,
      name: c.contact?.name ?? "Chat",
      role: c.contact?.role ?? null,
    });
    setView("thread");
  };

  const openContact = (contact: ChatContact) => {
    startConversation.mutate(contact.id, {
      onSuccess: (conversation) => {
        setActive({
          id: conversation.id,
          name: contact.name,
          role: contact.role,
        });
        setView("thread");
      },
    });
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="animate-in fade-in slide-in-from-bottom-4 bg-card fixed right-4 bottom-24 z-50 flex h-135 max-h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200 sm:right-6">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-3 py-3">
            {view === "thread" || view === "contacts" ? (
              <button
                type="button"
                aria-label="Back"
                onClick={() => {
                  setView("list");
                  setActive(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : (
              <MessageCircle className="text-primary size-5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {view === "thread"
                  ? active?.name
                  : view === "contacts"
                    ? "New message"
                    : "Messages"}
              </p>
              {view === "thread" && active?.role && (
                <p className="text-muted-foreground text-[11px]">
                  {roleLabel(active.role)}
                </p>
              )}
            </div>
            {view === "thread" && active && call && (
              <>
                <button
                  type="button"
                  aria-label="Voice call"
                  onClick={() =>
                    call.startCall(active.id, active.name, "audio")
                  }
                  className="text-muted-foreground hover:text-primary"
                >
                  <Phone className="size-4.5" />
                </button>
                <button
                  type="button"
                  aria-label="Video call"
                  onClick={() =>
                    call.startCall(active.id, active.name, "video")
                  }
                  className="text-muted-foreground hover:text-primary"
                >
                  <Video className="size-4.5" />
                </button>
              </>
            )}
            {view === "list" && user.roles.includes("admin") && (
              <Link
                href={ROUTES.chatAdmin}
                aria-label="Messaging controls"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-primary"
              >
                <Settings2 className="size-4.5" />
              </Link>
            )}
            {view === "list" && (
              <button
                type="button"
                aria-label="New message"
                onClick={() => setView("contacts")}
                className="text-muted-foreground hover:text-primary"
              >
                <PenSquare className="size-4.5" />
              </button>
            )}
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1 flex-col">
            {view === "list" &&
              (isPending ? (
                <div className="text-muted-foreground flex flex-1 items-center justify-center">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <ConversationList
                    conversations={conversations}
                    onSelect={openConversation}
                  />
                </div>
              ))}

            {view === "contacts" && (
              <div className="flex-1 overflow-y-auto">
                {startConversation.isPending ? (
                  <div className="text-muted-foreground flex items-center justify-center py-8">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                ) : (
                  <ContactPicker contacts={contacts} onPick={openContact} />
                )}
              </div>
            )}

            {view === "thread" && active && (
              <ChatThread conversationId={active.id} />
            )}
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed right-4 bottom-6 z-50 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95 sm:right-6",
          "bg-linear-to-br from-blue-500 to-violet-500",
        )}
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <>
            <MessageCircle className="size-6" />
            {unreadTotal > 0 && (
              <span className="ring-background absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2">
                {unreadTotal > 9 ? "9+" : unreadTotal}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
