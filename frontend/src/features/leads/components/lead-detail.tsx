"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";
import { useLead, useDeleteLead } from "../hooks/use-leads";
import { StatusBadge } from "./status-badge";
import { SourceBadge } from "./source-badge";
import { EditLeadDialog } from "./edit-lead-dialog";
import { QuoteHistory } from "./quote-history";
import { LEAD_STATUS } from "../types";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: lead, isPending, isError, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const [editOpen, setEditOpen] = useState(false);
  const { hasPermission } = useAuth();

  const canManage = hasPermission("leads.manage");

  const handleDelete = () => {
    if (!lead) return;
    if (
      window.confirm(
        `Are you sure you want to delete lead: "${lead.name}"? This action cannot be undone.`,
      )
    ) {
      deleteLead.mutate(lead.id, {
        onSuccess: () => {
          router.push(ROUTES.leads);
        },
      });
    }
  };

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-24 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading lead details…
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-medium">Couldn&apos;t load this lead.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
            <Link href={ROUTES.leads}>
              <ArrowLeft className="size-4" />
              All leads
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
            <StatusBadge status={lead.status} />
            <SourceBadge source={lead.source} />
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="size-4" />
              Edit details
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled={deleteLead.isPending}
              onClick={handleDelete}
            >
              {deleteLead.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete lead
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Meta label="Name" value={lead.name} />
              <Meta label="Email" value={lead.email ?? "—"} />
              <Meta label="Phone" value={lead.phone ?? "—"} />
              <Meta
                label="Source"
                value={<SourceBadge source={lead.source} />}
              />
              <Meta
                label="Status"
                value={<StatusBadge status={lead.status} />}
              />
              <Meta
                label="Created At"
                value={
                  lead.createdAt
                    ? format(new Date(lead.createdAt), "MMM d, yyyy HH:mm")
                    : "—"
                }
              />
            </div>

            {lead.status === LEAD_STATUS.LOST && lead.lostReason && (
              <>
                <Separator />
                <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-4">
                  <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Lost Reason
                  </p>
                  <p className="text-sm leading-relaxed">{lead.lostReason}</p>
                </div>
              </>
            )}

            {lead.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1 font-mono text-[10px] tracking-[0.18em] uppercase">
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <QuoteHistory leadId={lead.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                System Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Lead ID (UUID)</p>
                <p className="mt-0.5 font-mono text-xs break-all select-all">
                  {lead.id}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Last Updated</p>
                <p className="mt-0.5 text-xs">
                  {lead.updatedAt
                    ? format(new Date(lead.updatedAt), "MMM d, yyyy HH:mm")
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {canManage && editOpen && (
        <EditLeadDialog
          lead={lead}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
