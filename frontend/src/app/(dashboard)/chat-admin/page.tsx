"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import { AdminChatOversight, PolicyMatrix } from "@/features/chat";

type Tab = "permissions" | "oversight";

/**
 * Admin messaging control: the permission matrix (who may chat with whom) and
 * read-only oversight of every conversation. Admin only.
 */
export default function ChatAdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("permissions");

  if (user && !user.roles.includes("admin")) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ShieldAlert className="text-muted-foreground size-10" />
        <p className="text-sm font-medium">Admins only</p>
        <p className="text-muted-foreground text-sm">
          You don&apos;t have access to messaging controls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Messaging controls
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Decide who can talk to whom, and review any conversation.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        {(
          [
            ["permissions", "Permissions"],
            ["oversight", "Conversations"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === value
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "permissions" ? <PolicyMatrix /> : <AdminChatOversight />}
    </div>
  );
}
