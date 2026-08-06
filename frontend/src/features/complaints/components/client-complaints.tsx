"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MessageSquareWarning, Plus } from "lucide-react";
import { easeOut } from "@/animations/variants";
import { useComplaints } from "../hooks/use-complaints";
import { SubmitComplaintDialog } from "./submit-complaint-dialog";
import type { Complaint } from "../types";

const STATUS_META: Record<
  Complaint["status"],
  { label: string; cls: string }
> = {
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-300" },
  in_progress: { label: "In review", cls: "bg-sky-500/15 text-sky-300" },
  resolved: { label: "Resolved", cls: "bg-emerald-500/15 text-emerald-300" },
  dismissed: { label: "Closed", cls: "bg-white/10 text-muted-foreground" },
};

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut, delay },
  }),
};

/**
 * Client-facing complaints: file a concern and track its status. The backend
 * scopes the list to the signed-in client's own complaints; a project manager
 * and admin see them from their Complaints panel.
 */
export function ClientComplaints() {
  const [open, setOpen] = useState(false);
  const { data, isPending } = useComplaints({});
  const complaints = data?.complaints ?? [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        custom={0.05}
        variants={reveal}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            Support
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Complaints &amp; <span className="aurora-text">support</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
            Something not right with an order? Raise it here — your project
            manager is notified and will follow up.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="aurora-glow inline-flex h-12 items-center gap-2 rounded-full bg-[#3b82f6] px-6 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-[#60a5fa]"
        >
          <Plus className="size-4" />
          File a complaint
        </button>
      </motion.div>

      {/* List */}
      <motion.div
        custom={0.18}
        variants={reveal}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {isPending &&
          [1, 2].map((i) => (
            <div key={i} className="aurora-border h-24 animate-pulse rounded-2xl" />
          ))}

        {!isPending && complaints.length === 0 && (
          <div className="aurora-border rounded-2xl px-6 py-12 text-center">
            <span className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
              <MessageSquareWarning className="size-6" />
            </span>
            <p className="font-display mt-4 text-lg font-bold">
              No complaints — all good so far.
            </p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
              If an order isn&apos;t meeting your brief, file a complaint and
              we&apos;ll make it right.
            </p>
          </div>
        )}

        {complaints.map((c) => {
          const meta = STATUS_META[c.status];
          return (
            <div key={c.id} className="aurora-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{c.subject}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {c.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${meta.cls}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-muted-foreground mt-3 font-mono text-[10px] tracking-[0.15em] uppercase">
                Filed {format(new Date(c.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          );
        })}
      </motion.div>

      <SubmitComplaintDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
