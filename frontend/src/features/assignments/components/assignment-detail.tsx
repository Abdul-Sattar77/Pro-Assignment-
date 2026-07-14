"use client";

import { useState } from "react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  RotateCcw,
  Send,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  FolderOpen,
  ChevronDown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS: Record<string, any> = {
  "1": {
    id: "1",
    title: "Essay Writing — Climate Change",
    subject: "Environmental Science",
    status: "pending_assignment",
    priority: "high",
    description:
      "Write a 2000-word essay on climate change and its economic impacts. Use APA format with at least 10 peer-reviewed sources. Include an introduction, 3 main body sections, and a conclusion.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    wordCount: 2000,
    academicLevel: "Undergraduate",
    referencingStyle: "APA",
    client: { name: "John Smith", email: "john@example.com" },
    writer: null,
    projectManager: { name: "Project Manager" },
    files: [
      {
        name: "Assignment_Brief.pdf",
        size: "245 KB",
        uploadedBy: "John Smith",
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    events: [
      {
        type: "created",
        text: "Assignment created by Admin",
        time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        type: "assigned_pm",
        text: "Assigned to Project Manager",
        time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  "2": {
    id: "2",
    title: "Research Paper — Quantum Computing",
    subject: "Computer Science",
    status: "in_progress",
    priority: "urgent",
    description:
      "Comprehensive research paper on quantum computing applications in cybersecurity. 5000 words, IEEE format, minimum 15 sources.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    wordCount: 5000,
    academicLevel: "Masters",
    referencingStyle: "IEEE",
    client: { name: "Sarah Johnson", email: "sarah@example.com" },
    writer: { name: "Sara Writer", email: "sara@prossignment.test" },
    projectManager: { name: "Project Manager" },
    files: [
      {
        name: "Research_Requirements.pdf",
        size: "180 KB",
        uploadedBy: "Sarah Johnson",
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        name: "Draft_v1.docx",
        size: "512 KB",
        uploadedBy: "Sara Writer",
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
    events: [
      {
        type: "created",
        text: "Assignment created",
        time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        type: "assigned_writer",
        text: "Writer Sara assigned",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        type: "in_progress",
        text: "Writer started working",
        time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  },
};

const MOCK_WRITERS = [
  {
    id: "w1",
    name: "Sara Writer",
    activeAssignments: 2,
    rating: 4.8,
    expertise: ["CS", "AI", "Research"],
  },
  {
    id: "w2",
    name: "Ahmed Writer",
    activeAssignments: 1,
    rating: 4.6,
    expertise: ["Business", "Marketing", "Finance"],
  },
  {
    id: "w3",
    name: "Fatima Writer",
    activeAssignments: 0,
    rating: 4.9,
    expertise: ["Literature", "History", "Law"],
  },
];

const STATUS_STYLES: Record<string, string> = {
  pending_assignment: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  submitted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  under_review: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  revision_requested: "bg-red-500/15 text-red-400 border-red-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending_assignment: "Pending Assignment",
  in_progress: "In Progress",
  submitted: "Submitted",
  under_review: "Under Review",
  revision_requested: "Revision Requested",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const EVENT_ICONS: Record<string, any> = {
  created: FileText,
  assigned_pm: User,
  assigned_writer: UserPlus,
  in_progress: Clock,
  submitted: Send,
  revision_requested: RotateCcw,
  completed: CheckCircle2,
};

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

export function AssignmentDetail({ id }: { id: string }) {
  const [assignment, setAssignment] = useState(
    MOCK_ASSIGNMENTS[id] ?? MOCK_ASSIGNMENTS["1"],
  );
  const [revisionNote, setRevisionNote] = useState("");
  const [selectedWriter, setSelectedWriter] = useState("");
  const [writerDialogOpen, setWriterDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);

  const isOverdue =
    isPast(new Date(assignment.deadline)) &&
    !["completed", "cancelled"].includes(assignment.status);

  function assignWriter() {
    const writer = MOCK_WRITERS.find((w) => w.id === selectedWriter);
    if (!writer) return;
    setAssignment((prev: any) => ({
      ...prev,
      writer: { name: writer.name },
      status: "in_progress",
      events: [
        ...prev.events,
        {
          type: "assigned_writer",
          text: `Writer ${writer.name} assigned by PM`,
          time: new Date().toISOString(),
        },
      ],
    }));
    setWriterDialogOpen(false);
  }

  function changeStatus(newStatus: string) {
    setAssignment((prev: any) => ({
      ...prev,
      status: newStatus,
      events: [
        ...prev.events,
        {
          type: newStatus,
          text: `Status changed to ${STATUS_LABELS[newStatus]}`,
          time: new Date().toISOString(),
        },
      ],
    }));
  }

  function requestRevision() {
    if (!revisionNote.trim()) return;
    setAssignment((prev: any) => ({
      ...prev,
      status: "revision_requested",
      events: [
        ...prev.events,
        {
          type: "revision_requested",
          text: `Revision requested: ${revisionNote}`,
          time: new Date().toISOString(),
        },
      ],
    }));
    setRevisionNote("");
    setRevisionDialogOpen(false);
  }

  function approveAndDeliver() {
    setAssignment((prev: any) => ({
      ...prev,
      status: "completed",
      events: [
        ...prev.events,
        {
          type: "completed",
          text: "Assignment approved and delivered to client",
          time: new Date().toISOString(),
        },
      ],
    }));
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href={ROUTES.assignments}>
            <ArrowLeft className="size-4" />
            All assignments
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {assignment.title}
              </h1>
              <Badge
                variant="outline"
                className={cn("text-xs", STATUS_STYLES[assignment.status])}
              >
                {STATUS_LABELS[assignment.status]}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  PRIORITY_STYLES[assignment.priority],
                )}
              >
                {assignment.priority}
              </Badge>
              {isOverdue && (
                <Badge
                  variant="outline"
                  className="border-red-500/30 bg-red-500/15 text-xs text-red-400"
                >
                  <AlertTriangle className="mr-1 size-3" /> Overdue
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {assignment.subject}
            </p>
          </div>

          {/* ── PM Action Buttons ── */}
          <div className="flex flex-wrap gap-2">
            {/* Assign Writer */}
            {!assignment.writer && (
              <Dialog
                open={writerDialogOpen}
                onOpenChange={setWriterDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <UserPlus className="size-4" /> Assign Writer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Writer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-muted-foreground text-sm">
                      Select an available writer for this assignment.
                    </p>
                    <div className="space-y-2">
                      {MOCK_WRITERS.map((writer) => (
                        <div
                          key={writer.id}
                          onClick={() => setSelectedWriter(writer.id)}
                          className={cn(
                            "cursor-pointer rounded-lg border p-3 transition-colors",
                            selectedWriter === writer.id
                              ? "border-primary bg-primary/10"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{writer.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-400">
                                ★ {writer.rating}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  writer.activeAssignments === 0
                                    ? "border-green-400/30 text-green-400"
                                    : "text-muted-foreground",
                                )}
                              >
                                {writer.activeAssignments} active
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {writer.expertise.map((e) => (
                              <Badge
                                key={e}
                                variant="outline"
                                className="px-1.5 text-[10px]"
                              >
                                {e}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setWriterDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={assignWriter} disabled={!selectedWriter}>
                        Assign Writer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Change Status */}
            <Select onValueChange={changeStatus} value={assignment.status}>
              <SelectTrigger className="h-9 w-44 gap-1 text-xs">
                <ChevronDown className="size-3.5" />
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Request Revision */}
            {["submitted", "under_review"].includes(assignment.status) && (
              <Dialog
                open={revisionDialogOpen}
                onOpenChange={setRevisionDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-amber-400/30 text-amber-400"
                  >
                    <RotateCcw className="size-4" /> Request Revision
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Revision</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-muted-foreground text-sm">
                      Describe what needs to be revised.
                    </p>
                    <Textarea
                      value={revisionNote}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRevisionNote(e.target.value)
                      }
                      placeholder="e.g. Please improve the introduction and add more sources..."
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setRevisionDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={requestRevision}
                        disabled={!revisionNote.trim()}
                      >
                        Send Revision Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Approve & Deliver */}
            {["submitted", "under_review"].includes(assignment.status) && (
              <Button
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700"
                onClick={approveAndDeliver}
              >
                <CheckCircle2 className="size-4" /> Approve & Deliver
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* ── Left Column ── */}
        <div className="space-y-5">
          {/* Brief */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" /> Assignment Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Meta
                  label="Deadline"
                  value={format(
                    new Date(assignment.deadline),
                    "MMM d, yyyy HH:mm",
                  )}
                />
                <Meta
                  label="Word Count"
                  value={`${assignment.wordCount?.toLocaleString() ?? "—"} words`}
                />
                <Meta
                  label="Academic Level"
                  value={assignment.academicLevel ?? "—"}
                />
                <Meta
                  label="Referencing"
                  value={assignment.referencingStyle ?? "—"}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

          {/* Files */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="size-4" /> Files (
                {assignment.files?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignment.files?.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No files attached.
                </p>
              )}
              {assignment.files?.map((file: any, i: number) => (
                <div
                  key={i}
                  className="hover:bg-muted/30 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <FileText className="text-primary size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {file.size} · {file.uploadedBy} ·{" "}
                      {format(new Date(file.uploadedAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                  >
                    Download
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full gap-1.5"
              >
                <FolderOpen className="size-4" /> Upload File
              </Button>
            </CardContent>
          </Card>

          {/* Quick Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="size-4" /> Quick Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Send a message to writer or client..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5">
                  <Send className="size-4" /> Send to Writer
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Send className="size-4" /> Send to Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column — Timeline ── */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignment.events?.map((event: any, i: number) => {
                  const Icon = EVENT_ICONS[event.type] ?? CheckCircle2;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-full">
                          <Icon className="text-primary size-3.5" />
                        </div>
                        {i < assignment.events.length - 1 && (
                          <div className="bg-border mt-1 w-px flex-1" />
                        )}
                      </div>
                      <div className="min-w-0 pb-4">
                        <p className="text-xs leading-relaxed font-medium">
                          {event.text}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">
                          {format(new Date(event.time), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Writer Info */}
          {assignment.writer && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4" /> Assigned Writer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-bold">
                    {assignment.writer.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {assignment.writer.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {assignment.writer.email ?? "writer@prossignment.test"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <MessageSquare className="size-4" /> Message Writer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-amber-400/30 text-amber-400"
                >
                  <RotateCcw className="size-4" /> Reassign Writer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
