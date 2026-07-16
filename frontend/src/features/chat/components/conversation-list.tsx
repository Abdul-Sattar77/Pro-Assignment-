"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatContact, ChatConversation, ChatRole } from "../types";

const ROLE_LABEL: Record<ChatRole, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  writer: "Writer",
  client: "Client",
};

const ROLE_TINT: Record<ChatRole, string> = {
  admin: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  project_manager: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  writer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  client: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name, role }: { name: string; role: ChatRole | null }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        role ? ROLE_TINT[role] : "bg-muted",
      )}
    >
      {initials(name)}
    </span>
  );
}

export function roleLabel(role: ChatRole | null): string {
  return role ? ROLE_LABEL[role] : "";
}

/** List of existing conversations. */
export function ConversationList({
  conversations,
  onSelect,
}: {
  conversations: ChatConversation[];
  onSelect: (conversation: ChatConversation) => void;
}) {
  if (conversations.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-8 text-center text-sm">
        No conversations yet. Start one with the ✏️ button.
      </p>
    );
  }

  return (
    <ul>
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c)}
            className="hover:bg-muted/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
          >
            <Avatar
              name={c.contact?.name ?? "?"}
              role={c.contact?.role ?? null}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {c.contact?.name ?? "Unknown"}
                </p>
                {c.lastMessageAt && (
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    {formatDistanceToNowStrict(new Date(c.lastMessageAt))}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground truncate text-xs">
                {c.lastMessage
                  ? c.lastMessage.type === "text"
                    ? c.lastMessage.body
                    : `📎 ${c.lastMessage.type}`
                  : roleLabel(c.contact?.role ?? null)}
              </p>
            </div>
            {c.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                {c.unreadCount}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Picker of contacts the user may start a chat with. */
export function ContactPicker({
  contacts,
  onPick,
}: {
  contacts: ChatContact[];
  onPick: (contact: ChatContact) => void;
}) {
  if (contacts.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-8 text-center text-sm">
        You don&apos;t have anyone to message yet. An admin controls who can
        chat with whom.
      </p>
    );
  }

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          <button
            type="button"
            onClick={() => onPick(contact)}
            className="hover:bg-muted/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
          >
            <Avatar name={contact.name} role={contact.role} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{contact.name}</p>
              <p className="text-muted-foreground text-xs">
                {roleLabel(contact.role)}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
