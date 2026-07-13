"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  UserCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, AssignmentAction } from "../types";
import { ActionNoteDialog, type NoteActionConfig } from "./action-note-dialog";
import { AssignManagerDialog } from "./assign-manager-dialog";
import { AssignWriterDialog } from "./assign-writer-dialog";

interface ActionButton {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "destructive";
  /** null → opens the AssignWriterDialog, 'manager' → AssignManagerDialog. */
  dialog: NoteActionConfig | null | "manager";
}

/**
 * ═══════════════════ ACTION REGISTRY (extension point) ═══════════════════
 * One entry per workflow action. The backend decides WHO sees WHAT via the
 * `actions` array on each assignment — this map only defines how a button
 * looks and which dialog it opens.
 *
 * ➜ WRITER PANEL (tomorrow): add entries for "accept", "reject", "submit"
 *   below — the bar, dialog, and mutation hook already handle everything.
 *   Example:
 *   accept: { label: "Accept assignment", icon: Check, variant: "default",
 *     dialog: { action: "accept", title: "Accept this assignment?",
 *       description: "You commit to the deadline shown.", confirmLabel:
 *       "Accept", note: "none" } },
 * ══════════════════════════════════════════════════════════════════════════
 */
const ACTION_CONFIG: Partial<Record<AssignmentAction, ActionButton>> = {
  assign: {
    label: "Assign writer",
    icon: UserCheck,
    variant: "default",
    dialog: null, // opens AssignWriterDialog
  },
  assign_manager: {
    label: "Assign manager",
    icon: UserCog,
    variant: "outline",
    dialog: "manager", // opens AssignManagerDialog
  },
  deliver: {
    label: "Deliver to client",
    icon: PackageCheck,
    variant: "default",
    dialog: {
      action: "deliver",
      title: "Deliver to client?",
      description:
        "The client will be able to review, approve, or request a revision.",
      confirmLabel: "Deliver",
      note: "optional",
    },
  },
  accept: {
    label: "Accept assignment",
    icon: CheckCircle2,
    variant: "default",
    dialog: {
      action: "accept",
      title: "Accept this assignment?",
      description: "You commit to delivering by the deadline shown.",
      confirmLabel: "Accept",
      note: "none",
    },
  },
  reject: {
    label: "Decline assignment",
    icon: Ban,
    variant: "outline",
    dialog: {
      action: "reject",
      title: "Decline this assignment?",
      description: "The order will return to the queue for reassignment.",
      confirmLabel: "Decline",
      note: "optional",
    },
  },
  submit: {
    label: "Submit work",
    icon: PackageCheck,
    variant: "default",
    dialog: {
      action: "submit",
      title: "Submit work for review?",
      description: "The project manager will review your submission.",
      confirmLabel: "Submit",
      note: "optional",
    },
  },
  return: {
    label: "Return to writer",
    icon: RotateCcw,
    variant: "outline",
    dialog: {
      action: "return",
      title: "Return to writer",
      description: "Send the submission back with feedback for the writer.",
      confirmLabel: "Return with feedback",
      note: "optional",
    },
  },
  complete: {
    label: "Approve & complete",
    icon: CheckCircle2,
    variant: "default",
    dialog: {
      action: "complete",
      title: "Approve this delivery?",
      description: "This closes the order. You can no longer request changes.",
      confirmLabel: "Approve & complete",
      note: "none",
    },
  },
  request_revision: {
    label: "Request revision",
    icon: RotateCcw,
    variant: "outline",
    dialog: {
      action: "request_revision",
      title: "Request a revision",
      description: "Tell the team exactly what should change.",
      confirmLabel: "Send revision request",
      note: "required",
    },
  },
  cancel: {
    label: "Cancel order",
    icon: Ban,
    variant: "destructive",
    dialog: {
      action: "cancel",
      title: "Cancel this order?",
      description:
        "This cannot be undone. A note helps everyone understand why.",
      confirmLabel: "Cancel order",
      note: "optional",
      destructive: true,
    },
  },
};

/**
 * The workflow action bar. Renders ONLY the buttons the backend granted this
 * viewer (assignment.actions) AND that have UI config above — so unfinished
 * role UIs never show broken buttons.
 */
export function AssignmentActions({ assignment }: { assignment: Assignment }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignManagerOpen, setAssignManagerOpen] = useState(false);
  const [noteConfig, setNoteConfig] = useState<NoteActionConfig | null>(null);

  const buttons = assignment.actions
    .map((action) => ({ action, config: ACTION_CONFIG[action] }))
    .filter(
      (entry): entry is { action: AssignmentAction; config: ActionButton } =>
        entry.config !== undefined,
    );

  if (buttons.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {buttons.map(({ action, config }) => (
          <Button
            key={action}
            variant={config.variant}
            onClick={() => {
              if (config.dialog === null) return setAssignOpen(true);
              if (config.dialog === "manager") return setAssignManagerOpen(true);
              setNoteConfig(config.dialog);
            }}
          >
            <config.icon className="size-4" />
            {config.label}
          </Button>
        ))}
      </div>

      <AssignWriterDialog
        assignmentId={assignment.id}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
      <AssignManagerDialog
        assignmentId={assignment.id}
        open={assignManagerOpen}
        onOpenChange={setAssignManagerOpen}
      />
      <ActionNoteDialog
        assignmentId={assignment.id}
        config={noteConfig}
        onClose={() => setNoteConfig(null)}
      />
    </>
  );
}
