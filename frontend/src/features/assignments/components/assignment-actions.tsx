"use client";

import { useState } from "react";
import {
  Ban,
  Check,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Upload,
  UserCheck,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, AssignmentAction } from "../types";
import { ActionNoteDialog, type NoteActionConfig } from "./action-note-dialog";
import { AssignWriterDialog } from "./assign-writer-dialog";
import { AssignManagerDialog } from "./assign-manager-dialog";

interface ActionButton {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "destructive";
  /** null → opens the AssignWriterDialog or AssignManagerDialog. */
  dialogType: "writer" | "manager" | NoteActionConfig;
}

/**
 * ═══════════════════ ACTION REGISTRY (extension point) ═══════════════════
 * One entry per workflow action. The backend decides WHO sees WHAT via the
 * `actions` array on each assignment — this map only defines how a button
 * looks and which dialog it opens.
 * ══════════════════════════════════════════════════════════════════════════
 */
const ACTION_CONFIG: Partial<Record<AssignmentAction, ActionButton>> = {
  assign_manager: {
    label: "Assign PM",
    icon: UserCog,
    variant: "outline",
    dialogType: "manager",
  },
  assign: {
    label: "Assign writer",
    icon: UserCheck,
    variant: "default",
    dialogType: "writer",
  },
  accept: {
    label: "Accept assignment",
    icon: Check,
    variant: "default",
    dialogType: {
      action: "accept",
      title: "Accept this assignment?",
      description:
        "You commit to delivering by the deadline shown on this order.",
      confirmLabel: "Accept assignment",
      note: "none",
    },
  },
  reject: {
    label: "Decline",
    icon: X,
    variant: "outline",
    dialogType: {
      action: "reject",
      title: "Decline this assignment?",
      description:
        "The order returns to the manager's queue. A short reason helps them re-assign faster.",
      confirmLabel: "Decline assignment",
      note: "optional",
    },
  },
  submit: {
    label: "Submit work",
    icon: Upload,
    variant: "default",
    dialogType: {
      action: "submit",
      title: "Submit for review",
      description:
        "Your manager reviews the work before it is delivered to the client.",
      confirmLabel: "Submit work",
      note: "optional",
    },
  },
  deliver: {
    label: "Deliver to client",
    icon: PackageCheck,
    variant: "default",
    dialogType: {
      action: "deliver",
      title: "Deliver to client?",
      description:
        "The client will be able to review, approve, or request a revision.",
      confirmLabel: "Deliver",
      note: "optional",
    },
  },
  return: {
    label: "Return to writer",
    icon: RotateCcw,
    variant: "outline",
    dialogType: {
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
    dialogType: {
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
    dialogType: {
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
    dialogType: {
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
 * The workflow action bar.
 */
export function AssignmentActions({ assignment }: { assignment: Assignment }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [noteConfig, setNoteConfig] = useState<NoteActionConfig | null>(null);

  const actionsToRender: AssignmentAction[] = Array.from(
    new Set(assignment.actions),
  );

  const buttons = actionsToRender
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
              if (config.dialogType === "writer") {
                setAssignOpen(true);
              } else if (config.dialogType === "manager") {
                setManagerOpen(true);
              } else {
                setNoteConfig(config.dialogType);
              }
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
        open={managerOpen}
        onOpenChange={setManagerOpen}
      />
      <ActionNoteDialog
        assignmentId={assignment.id}
        config={noteConfig}
        onClose={() => setNoteConfig(null)}
      />
    </>
  );
}
