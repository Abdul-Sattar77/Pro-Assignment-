"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { useAssignment } from "../hooks/use-assignments";
import type { Assignment } from "../types";
import { AssignmentActions } from "./assignment-actions";
import { AssignmentTimeline } from "./assignment-timeline";
import { AttachmentList } from "./attachment-list";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { VoiceNotesList } from "./voice-notes-list";
import { useAuth } from "@/features/auth";
import { EditAssignmentDialog } from "./edit-assignment-dialog";

/** Compact label/value pair in the meta grid. */
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

/**
 * Full order view — tabs: Overview | Files & Voice | Timeline.
 * One page serves every role; the action bar renders only the buttons the
 * backend granted this viewer (via `actions` array).
 */
export function AssignmentDetail({ id }: { id: string }) {
  const { data: assignment, isPending, isError, refetch } = useAssignment(id);
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useAuth();

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

  const attachments = assignment.attachments ?? [];
  
  const isStaff = user?.roles.includes("admin") || user?.roles.includes("project_manager");
  const isWriter = user?.roles.includes("writer") && assignment.writer?.id === user?.id;
  const isClient = user?.roles.includes("client") && assignment.client?.id === user?.id;
  
  const canUpload = isStaff || isWriter || isClient;
  const canDelete = user?.roles.includes("admin");

  return (
    <div className="space-y-6">
      {/* Back nav */}
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
          {assignment.priority && (
            <PriorityBadge priority={assignment.priority} />
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {assignment.subject}
        </p>
      </div>

      {/* Workflow actions for THIS viewer */}
      <AssignmentActions assignment={assignment} />

      {/* Tabbed detail area */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">
            Files & Voice
            {attachments.length > 0 && (
              <span className="bg-muted ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {attachments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Brief</CardTitle>
                {isStaff && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setEditOpen(true)}
                  >
                    <Edit className="size-3.5" />
                    Edit Details
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {assignment.description}
                </p>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                  {assignment.wordCount != null && (
                    <Meta
                      label="Word count"
                      value={assignment.wordCount.toLocaleString()}
                    />
                  )}
                  {assignment.priority && (
                    <Meta
                      label="Priority"
                      value={<PriorityBadge priority={assignment.priority} />}
                    />
                  )}
                </div>

                {assignment.notes && (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <p className="text-muted-foreground mb-1 font-mono text-[10px] tracking-[0.18em] uppercase">
                        Internal notes
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {assignment.notes}
                      </p>
                    </div>
                  </>
                )}

                {isStaff && (assignment.clientPrice != null || assignment.writerCost != null || assignment.netProfit != null) && (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <p className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                        Financials (Staff Only)
                      </p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Meta
                          label="Client Price"
                          value={assignment.clientPrice ? `$${Number(assignment.clientPrice).toFixed(2)}` : "—"}
                        />
                        <Meta
                          label="Writer Cost"
                          value={assignment.writerCost ? `$${Number(assignment.writerCost).toFixed(2)}` : "—"}
                        />
                        <Meta
                          label="Discount"
                          value={assignment.discount ? `$${Number(assignment.discount).toFixed(2)}` : "—"}
                        />
                        <Meta
                          label="Net Profit"
                          value={assignment.netProfit ? `$${Number(assignment.netProfit).toFixed(2)}` : "—"}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentTimeline events={assignment.events ?? []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Files & Voice Notes tab */}
        <TabsContent value="files" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentList
                  assignmentId={assignment.id}
                  attachments={attachments}
                  canUpload={canUpload}
                  canDelete={canDelete}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voice Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceNotesList
                  assignmentId={assignment.id}
                  attachments={attachments}
                  canUpload={canUpload}
                  canDelete={canDelete}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline tab */}
        <TabsContent value="timeline" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Full Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentTimeline events={assignment.events ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isStaff && editOpen && (
        <EditAssignmentDialog
          assignment={assignment}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
