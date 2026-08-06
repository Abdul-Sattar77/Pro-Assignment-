"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth";
import { formatCurrency } from "@/config/currency";
import { PRIORITY_META } from "../constants";
import {
  useAssignment,
  useAssignmentAttachments,
} from "../hooks/use-assignments";
import { AssignmentActions } from "./assignment-actions";
import { ClientFeedback } from "./client-feedback";
import { AssignmentTimeline } from "./assignment-timeline";
import { ChatPanel } from "./chat-panel";
import { FilesPanel } from "./files-panel";
import { StatusBadge } from "./status-badge";
import { VoiceNotesList } from "./voice-notes-list";

/** Label/value pair in the meta grid. Renders nothing when value is empty. */
function Meta({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

/**
 * Full order view — ONE page serves every role: the action bar renders only
 * the buttons the backend granted this viewer, so PM sees assign/deliver/
 * return, the writer sees accept/submit (once its config lands), and the
 * client sees complete/request-revision.
 */
export function AssignmentDetail({ id }: { id: string }) {
  const { data: assignment, isPending, isError, refetch } = useAssignment(id);
  const { data: user } = useCurrentUser();
  const { data: attachments = [], isPending: attachmentsLoading } =
    useAssignmentAttachments(id);
  const isClient = Boolean(user?.roles.includes("client"));
  const isAdmin = Boolean(user?.roles.includes("admin"));

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-24 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading assignment…
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-medium">
          Couldn&apos;t load this assignment.
        </p>
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
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href={ROUTES.assignments}>
            <ArrowLeft className="size-4" />
            All assignments
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment.title}
          </h1>
          <StatusBadge status={assignment.status} />
          {assignment.priority !== "standard" && (
            <Badge
              variant="outline"
              className={cn(PRIORITY_META[assignment.priority].className)}
            >
              {assignment.priorityLabel}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {assignment.typeLabel
            ? `${assignment.typeLabel} · ${assignment.subject}`
            : assignment.subject}
        </p>
      </div>

      {/* Workflow actions for THIS viewer */}
      <AssignmentActions assignment={assignment} />

      {/* Client feedback: review the writer / report an issue to admin */}
      {isClient && (
        <ClientFeedback
          assignmentId={assignment.id}
          writerId={assignment.writer?.id}
          writerName={assignment.writer?.name}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left column: brief + files */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brief</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
              <Separator className="my-5" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Meta
                  label="Deadline"
                  value={format(
                    new Date(assignment.deadline),
                    "MMM d, yyyy HH:mm",
                  )}
                />
                <Meta label="Client" value={assignment.client?.name ?? "—"} />
                <Meta
                  label="Writer"
                  value={assignment.writer?.name ?? "Unassigned"}
                />
                <Meta
                  label="Manager"
                  value={assignment.projectManager?.name ?? "—"}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Meta label="Type" value={assignment.typeLabel} />
                <Meta label="Subject" value={assignment.subject} />
                <Meta
                  label="Academic level"
                  value={assignment.academicLevelLabel}
                />
                <Meta label="Course" value={assignment.course} />
                <Meta label="University" value={assignment.university} />
                <Meta
                  label="Word count"
                  value={
                    assignment.wordCount
                      ? assignment.wordCount.toLocaleString()
                      : null
                  }
                />
                <Meta label="Referencing" value={assignment.referencingStyle} />
                <Meta label="Priority" value={assignment.priorityLabel} />
                <Meta label="Phone" value={assignment.contactPhone} />
                <Meta label="WhatsApp" value={assignment.contactWhatsapp} />
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary — visible to Admin & PM only */}
          {(isAdmin || user?.roles.includes("project_manager")) && (
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-emerald-600" /> Financial
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                      Client Price
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(assignment.clientPrice ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                      Writer Cost
                    </p>
                    <p className="mt-1 text-sm font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(assignment.writerCost ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                      Additional Costs
                    </p>
                    <p className="mt-1 text-sm font-semibold text-rose-500">
                      {formatCurrency(assignment.additionalCosts ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                      Net Profit
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${(assignment.netProfit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {formatCurrency(assignment.netProfit ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                      Profit Margin
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${(assignment.profitMargin ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {assignment.profitMargin ?? 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <FilesPanel assignmentId={assignment.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Voice instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceNotesList
                assignmentId={assignment.id}
                attachments={attachments}
                loading={attachmentsLoading}
                canUpload
                canDelete={isAdmin}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: chat + activity */}
        <div className="space-y-6">
          <ChatPanel assignmentId={assignment.id} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentTimeline events={assignment.events ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
