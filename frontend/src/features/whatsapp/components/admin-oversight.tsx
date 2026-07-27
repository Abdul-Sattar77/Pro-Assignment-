"use client";

import { format } from "date-fns";
import { Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useRestoreWhatsAppMessage,
  useWhatsAppAuditLog,
  useWhatsAppHiddenMessages,
} from "../hooks/use-whatsapp";

/**
 * Admin-only oversight.
 *
 * Two panels that together answer "what did my sales team do": every message a
 * rep hid (with its full body intact), and the raw activity log of sends,
 * hides, restores, reassignments and archives.
 */
export function WhatsAppAdminOversight() {
  const { data: hidden = [], isPending: loadingHidden } =
    useWhatsAppHiddenMessages();
  const { data: audit = [], isPending: loadingAudit } = useWhatsAppAuditLog();
  const restore = useRestoreWhatsAppMessage();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <ShieldAlert className="size-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Hidden by sales</h3>
          <span className="text-muted-foreground ml-auto text-xs">
            {hidden.length} message{hidden.length === 1 ? "" : "s"}
          </span>
        </header>

        <div className="max-h-112 overflow-y-auto">
          {loadingHidden ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : hidden.length === 0 ? (
            <p className="text-muted-foreground px-4 py-10 text-center text-sm">
              Nothing has been hidden. Any message a rep hides will appear here
              in full.
            </p>
          ) : (
            <ul className="divide-border/50 divide-y">
              {hidden.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        {m.direction === "outbound"
                          ? `Sent by ${m.sender?.name ?? "unknown"}`
                          : "From customer"}
                      </p>
                      <p className="mt-0.5 wrap-break-word">
                        {m.body ?? (
                          <span className="text-muted-foreground italic">
                            {m.type} message
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[11px]">
                        Hidden by {m.deletedBy?.name ?? "unknown"}
                        {m.deletedAt &&
                          ` · ${format(new Date(m.deletedAt), "d MMM yyyy HH:mm")}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={restore.isPending}
                      onClick={() => restore.mutate(m.id)}
                    >
                      <RotateCcw className="size-3" />
                      Restore
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border">
        <header className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Activity log</h3>
          <p className="text-muted-foreground text-xs">
            Every WhatsApp action, with the user who performed it.
          </p>
        </header>

        <div className="max-h-112 overflow-y-auto">
          {loadingAudit ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : audit.length === 0 ? (
            <p className="text-muted-foreground px-4 py-10 text-center text-sm">
              No activity recorded yet.
            </p>
          ) : (
            <ul className="divide-border/50 divide-y text-xs">
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-muted-foreground">
                      {entry.causer?.name ?? "System"}
                    </p>
                  </div>
                  {entry.createdAt && (
                    <span className="text-muted-foreground shrink-0">
                      {format(new Date(entry.createdAt), "d MMM HH:mm")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
