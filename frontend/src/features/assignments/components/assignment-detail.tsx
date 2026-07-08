"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { useAssignment } from "../hooks/use-assignments";
import { AssignmentActions } from "./assignment-actions";
import { AssignmentTimeline } from "./assignment-timeline";
import { FilesPanel } from "./files-panel";
import { StatusBadge } from "./status-badge";

/** Label/value pair in the meta grid. */
function Meta({ label, value }: { label: string; value: string }) {
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

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-24 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading order…
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-medium">Couldn&apos;t load this order.</p>
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
            All orders
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment.title}
          </h1>
          <StatusBadge status={assignment.status} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {assignment.subject}
        </p>
      </div>

      {/* Workflow actions for THIS viewer */}
      <AssignmentActions assignment={assignment} />

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

          <FilesPanel assignmentId={assignment.id} />
        </div>

        {/* Timeline */}
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
  );
}
