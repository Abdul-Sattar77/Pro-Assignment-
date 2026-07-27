"use client";

import { useState } from "react";
import {
  Archive,
  Inbox,
  Loader2,
  MessageCircle,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import {
  WhatsAppAdminOversight,
  WhatsAppConversationList,
  WhatsAppThread,
  useWhatsAppConversations,
  useWhatsAppRealtime,
} from "@/features/whatsapp";
import { WA, doodleStyle } from "@/features/whatsapp/theme";

type Tab = "inbox" | "archived" | "oversight";

/**
 * WhatsApp Business inbox.
 *
 * Deliberately styled as WhatsApp Web rather than the portal's design system:
 * sales staff move between this screen and real WhatsApp constantly, and the
 * familiarity is the point. Palette lives in features/whatsapp/theme.ts.
 */
export default function WhatsAppPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [search, setSearch] = useState("");
  // Only the id is state; the conversation itself is derived from the list, so
  // the open thread's header stays in step with each refresh.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canView = user?.permissions?.includes("whatsapp.view") ?? false;
  const canAudit = user?.permissions?.includes("whatsapp.audit") ?? false;
  const canHide = user?.permissions?.includes("whatsapp.delete") ?? false;

  const archived = tab === "archived";
  const { data: conversations = [], isPending } = useWhatsAppConversations(
    archived,
    search,
  );

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // One subscription for the whole inbox — see useWhatsAppRealtime.
  useWhatsAppRealtime(selectedId);

  if (user && !canView) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ShieldAlert className="text-muted-foreground size-10" />
        <p className="text-sm font-medium">No access</p>
        <p className="text-muted-foreground text-sm">
          The WhatsApp inbox is available to admins and the sales team.
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
    { key: "inbox", label: "Chats", icon: Inbox },
    { key: "archived", label: "Archived", icon: Archive },
    ...(canAudit
      ? [{ key: "oversight" as Tab, label: "Oversight", icon: ShieldAlert }]
      : []),
  ];

  if (tab === "oversight") {
    return (
      <div className="space-y-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <WhatsAppAdminOversight />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm">{error}</p>
          <button type="button" onClick={() => setError(null)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Two-panel WhatsApp Web layout. */}
      <div
        className={cn(
          "grid h-[calc(100vh-13rem)] min-h-125 grid-cols-1 overflow-hidden rounded-lg border shadow-sm md:grid-cols-[minmax(20rem,30%)_1fr]",
          WA.border,
        )}
      >
        {/* ---- Chat list ---- */}
        <div
          className={cn(
            "flex min-h-0 flex-col border-r",
            WA.panel,
            WA.border,
            // On narrow screens show one pane at a time.
            selected && "hidden md:flex",
          )}
        >
          <div className={cn("shrink-0 px-3 py-2", WA.header)}>
            <div className="relative">
              <Search
                className={cn(
                  "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                  WA.muted,
                )}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or start a new chat"
                className={cn(
                  "h-9 w-full rounded-lg pr-3 pl-10 text-[14px]",
                  "placeholder:text-[#8696a0] focus-visible:outline-none",
                  WA.panel,
                  WA.text,
                )}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isPending ? (
              <div className="flex justify-center py-10">
                <Loader2 className={cn("size-5 animate-spin", WA.muted)} />
              </div>
            ) : (
              <WhatsAppConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={(c) => setSelectedId(c.id)}
              />
            )}
          </div>
        </div>

        {/* ---- Thread ---- */}
        <div className={cn("relative min-h-0", !selected && "hidden md:block")}>
          {selected ? (
            <WhatsAppThread
              key={selected.id}
              conversation={selected}
              canHide={canHide}
              onError={setError}
            />
          ) : (
            <div
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-3 text-center",
                WA.chat,
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.04] dark:invert"
                style={doodleStyle}
              />
              <MessageCircle
                className={cn("relative size-16 opacity-25", WA.muted)}
              />
              <div className="relative">
                <p className={cn("text-[20px] font-light", WA.text)}>
                  Portal WhatsApp
                </p>
                <p className={cn("mt-1 max-w-sm text-[13px]", WA.muted)}>
                  Select a chat to read and reply. Customers keep using WhatsApp
                  normally — every message is stored and audited here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Portal-level tab strip sitting above the WhatsApp surface. */
function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: Tab; label: string; icon: typeof Inbox }[];
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            active === key
              ? "bg-[#00a884] text-white"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
