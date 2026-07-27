"use client";

import { useState } from "react";
import {
  Archive,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  TriangleAlert,
  X,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import {
  EmailAdminOversight,
  EmailThreadList,
  EmailThreadView,
  useEmailRealtime,
  useEmailThreads,
} from "@/features/email";
import { GM } from "@/features/email/theme";

type Tab = "inbox" | "archived" | "oversight";

/**
 * Shared email inbox (Gmail / Google Workspace).
 *
 * Styled after Gmail rather than the portal's design system, for the same
 * reason as the WhatsApp inbox: staff move between the two constantly.
 * Palette lives in features/email/theme.ts.
 */
export default function EmailPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canView = user?.permissions?.includes("email.view") ?? false;
  const canAudit = user?.permissions?.includes("email.audit") ?? false;
  const canHide = user?.permissions?.includes("email.delete") ?? false;
  const canSend = user?.permissions?.includes("email.send") ?? false;

  const archived = tab === "archived";
  const { data, isPending, isFetching, refetch } = useEmailThreads(
    archived,
    search,
  );

  const threads = data?.threads ?? [];
  const meta = data?.meta;
  const selected = threads.find((t) => t.id === selectedId) ?? null;

  useEmailRealtime(selectedId);

  if (user && !canView) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ShieldAlert className="text-muted-foreground size-10" />
        <p className="text-sm font-medium">No access</p>
        <p className="text-muted-foreground text-sm">
          The email inbox is available to admins and the sales team.
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
    { key: "inbox", label: "Inbox", icon: Inbox },
    { key: "archived", label: "Archived", icon: Archive },
    ...(canAudit
      ? [{ key: "oversight" as Tab, label: "Oversight", icon: ShieldAlert }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              tab === key
                ? "bg-[#0b57d0] text-white"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}

        {meta?.mailbox && (
          <span
            className={cn(
              "ml-auto flex items-center gap-1.5 text-xs",
              GM.muted,
            )}
          >
            <Mail className="size-3.5" />
            {meta.mailbox}
            {meta.lastSyncedAt && (
              <>
                {" "}
                · synced{" "}
                {formatDistanceToNowStrict(new Date(meta.lastSyncedAt))} ago
              </>
            )}
          </span>
        )}
      </div>

      {/* Mailbox health — a silent sync failure would otherwise look like
          "no new mail today". */}
      {meta && !meta.configured && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm">
            Gmail is not connected yet. Set <code>GMAIL_MAILBOX</code> and the
            credentials for your <code>GMAIL_AUTH_MODE</code> — see
            docs/architecture/email-integration.md.
          </p>
        </div>
      )}

      {meta?.lastError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
          <p className="text-sm">Last sync failed: {meta.lastError}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm">{error}</p>
          <button type="button" onClick={() => setError(null)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      {tab === "oversight" ? (
        <EmailAdminOversight />
      ) : (
        <div
          className={cn(
            "grid h-[calc(100vh-14rem)] min-h-125 grid-cols-1 overflow-hidden rounded-lg border shadow-sm md:grid-cols-[minmax(22rem,34%)_1fr]",
            GM.border,
            GM.surface,
          )}
        >
          {/* ---- Thread list ---- */}
          <div
            className={cn(
              "flex min-h-0 flex-col border-r",
              GM.border,
              selected && "hidden md:flex",
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center gap-2 border-b px-3 py-2",
                GM.border,
                GM.toolbar,
              )}
            >
              <div className="relative flex-1">
                <Search
                  className={cn(
                    "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                    GM.muted,
                  )}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search mail"
                  className={cn(
                    "h-9 w-full rounded-lg border pr-3 pl-10 text-[13.5px] focus-visible:outline-none",
                    GM.border,
                    GM.surface,
                    GM.text,
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                title="Refresh"
                className={cn(
                  "rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5",
                  GM.muted,
                )}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isPending ? (
                <div className="flex justify-center py-10">
                  <Loader2 className={cn("size-5 animate-spin", GM.muted)} />
                </div>
              ) : (
                <EmailThreadList
                  threads={threads}
                  selectedId={selectedId}
                  onSelect={(t) => setSelectedId(t.id)}
                />
              )}
            </div>
          </div>

          {/* ---- Reading pane ---- */}
          <div className={cn("min-h-0", !selected && "hidden md:block")}>
            {selected ? (
              <EmailThreadView
                key={selected.id}
                thread={selected}
                canHide={canHide}
                canSend={canSend}
                onError={setError}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Mail className={cn("size-16 opacity-20", GM.muted)} />
                <div>
                  <p className={cn("text-[18px]", GM.text)}>
                    Select a conversation
                  </p>
                  <p className={cn("mt-1 max-w-sm text-[13px]", GM.muted)}>
                    Mail sent to the shared mailbox appears here. Every message
                    is stored and audited.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
