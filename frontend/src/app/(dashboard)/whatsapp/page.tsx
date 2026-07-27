"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Inbox,
  Loader2,
  MessageCircle,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import {
  WhatsAppAdminOversight,
  WhatsAppConversationList,
  WhatsAppThread,
  useWhatsAppConversations,
  useWhatsAppRealtime,
} from "@/features/whatsapp";

type Tab = "inbox" | "archived" | "oversight";

/**
 * WhatsApp Business inbox.
 *
 * Customers keep using WhatsApp exactly as before; every message they send to
 * the business number lands here in real time. Admins additionally get the
 * oversight tab: hidden messages and the full activity log.
 */
export default function WhatsAppPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [search, setSearch] = useState("");
  // Only the id is state; the conversation itself is derived from the list, so
  // the open thread's header (unread badge, service window) stays in step with
  // each refresh without an effect syncing two copies.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canView = user?.permissions?.includes("whatsapp.view") ?? false;
  const canAudit = user?.permissions?.includes("whatsapp.audit") ?? false;
  const canHide = user?.permissions?.includes("whatsapp.delete") ?? false;

  const archived = tab === "archived";
  const {
    data: conversations = [],
    isPending,
    refetch,
  } = useWhatsAppConversations(archived, search);

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
    { key: "inbox", label: "Inbox", icon: Inbox },
    { key: "archived", label: "Archived", icon: Archive },
    ...(canAudit
      ? [{ key: "oversight" as Tab, label: "Oversight", icon: ShieldAlert }]
      : []),
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="WhatsApp"
          description="Messages from your WhatsApp Business number. Customers keep using WhatsApp as normal — every message is stored and audited here."
          actions={
            <div className="flex items-center gap-1 rounded-lg border p-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    tab === key
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          }
        />
      </motion.div>

      {error && (
        <motion.div
          variants={fadeIn}
          className="flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <p className="text-sm">{error}</p>
          <button type="button" onClick={() => setError(null)}>
            <X className="size-4" />
          </button>
        </motion.div>
      )}

      {tab === "oversight" ? (
        <motion.div variants={fadeIn}>
          <WhatsAppAdminOversight />
        </motion.div>
      ) : (
        <motion.div
          variants={fadeIn}
          className="grid h-[calc(100vh-16rem)] min-h-[32rem] grid-cols-1 gap-4 lg:grid-cols-[22rem_1fr]"
        >
          {/* Thread list */}
          <div className="flex min-h-0 flex-col rounded-xl border">
            <div className="border-b p-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or number…"
                  className="h-9 pl-8"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isPending ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="text-muted-foreground size-5 animate-spin" />
                </div>
              ) : (
                <WhatsAppConversationList
                  conversations={conversations}
                  selectedId={selectedId}
                  onSelect={(c) => setSelectedId(c.id)}
                />
              )}
            </div>

            <div className="border-t p-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => void refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Thread */}
          <div className="min-h-0 rounded-xl border">
            {selected ? (
              <WhatsAppThread
                key={selected.id}
                conversation={selected}
                canHide={canHide}
                onError={setError}
              />
            ) : (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
                <MessageCircle className="size-10 opacity-30" />
                <p className="text-sm">Select a conversation to view it.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
