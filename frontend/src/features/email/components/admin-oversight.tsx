"use client";

import { format } from "date-fns";
import { Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEmailAuditLog,
  useEmailHiddenMessages,
  useRestoreEmailMessage,
} from "../hooks/use-email";
import { GM } from "../theme";

/**
 * Admin-only oversight.
 *
 * Two panels that together answer "what did my sales team do with our email":
 * every message a rep hid (body intact), and the activity log of sends, hides,
 * restores, reassignments and archives.
 */
export function EmailAdminOversight() {
  const { data: hidden = [], isPending: loadingHidden } =
    useEmailHiddenMessages();
  const { data: audit = [], isPending: loadingAudit } = useEmailAuditLog();
  const restore = useRestoreEmailMessage();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={cn("rounded-xl border", GM.border, GM.raised)}>
        <header
          className={cn(
            "flex items-center gap-2 border-b px-4 py-3",
            GM.border,
          )}
        >
          <ShieldAlert className="size-4 text-amber-500" />
          <h3 className={cn("text-sm font-semibold", GM.text)}>
            Hidden by sales
          </h3>
          <span className={cn("ml-auto text-xs", GM.muted)}>
            {hidden.length} email{hidden.length === 1 ? "" : "s"}
          </span>
        </header>

        <div className="max-h-112 overflow-y-auto">
          {loadingHidden ? (
            <div className="flex justify-center py-10">
              <Loader2 className={cn("size-5 animate-spin", GM.muted)} />
            </div>
          ) : hidden.length === 0 ? (
            <p className={cn("px-4 py-10 text-center text-sm", GM.muted)}>
              Nothing has been hidden. Any email a rep hides appears here in
              full.
            </p>
          ) : (
            <ul className={cn("divide-y", GM.border)}>
              {hidden.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("text-xs font-medium", GM.text)}>
                        {m.outbound
                          ? `Sent by ${m.sender?.name ?? "Gmail (no portal user)"}`
                          : `From ${m.from.name ?? m.from.email}`}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[13px] font-medium",
                          GM.text,
                        )}
                      >
                        {m.subject ?? "(no subject)"}
                      </p>
                      <p
                        className={cn("mt-0.5 line-clamp-2 text-xs", GM.muted)}
                      >
                        {m.snippet ?? m.bodyText}
                      </p>
                      <p className={cn("mt-1 text-[11px]", GM.muted)}>
                        Hidden by {m.deletedBy?.name ?? "unknown"}
                        {m.deletedAt &&
                          ` · ${format(new Date(m.deletedAt), "d MMM yyyy HH:mm")}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={restore.isPending}
                      onClick={() => restore.mutate(m.id)}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs",
                        GM.border,
                        GM.text,
                      )}
                    >
                      <RotateCcw className="size-3" />
                      Restore
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={cn("rounded-xl border", GM.border, GM.raised)}>
        <header className={cn("border-b px-4 py-3", GM.border)}>
          <h3 className={cn("text-sm font-semibold", GM.text)}>Activity log</h3>
          <p className={cn("text-xs", GM.muted)}>
            Every email action, with the user who performed it.
          </p>
        </header>

        <div className="max-h-112 overflow-y-auto">
          {loadingAudit ? (
            <div className="flex justify-center py-10">
              <Loader2 className={cn("size-5 animate-spin", GM.muted)} />
            </div>
          ) : audit.length === 0 ? (
            <p className={cn("px-4 py-10 text-center text-sm", GM.muted)}>
              No activity recorded yet.
            </p>
          ) : (
            <ul className={cn("divide-y text-xs", GM.border)}>
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className={cn("font-medium", GM.text)}>
                      {entry.description}
                    </p>
                    <p className={GM.muted}>{entry.causer?.name ?? "System"}</p>
                  </div>
                  {entry.createdAt && (
                    <span className={cn("shrink-0", GM.muted)}>
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
