"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAssignmentAction } from "../hooks/use-assignments";
import type { AssignmentAction } from "../types";

export interface NoteActionConfig {
  action: Exclude<AssignmentAction, "assign">;
  title: string;
  description: string;
  confirmLabel: string;
  /** "none" hides the field, "optional"/"required" show a textarea. */
  note: "none" | "optional" | "required";
  destructive?: boolean;
}

interface ActionNoteDialogProps {
  assignmentId: string;
  config: NoteActionConfig | null;
  onClose: () => void;
}

/**
 * ONE dialog powers every note-style workflow action (deliver, return,
 * cancel, complete, request revision — and the Writer panel's accept/reject/
 * submit tomorrow). To add an action: add its config in assignment-actions.tsx
 * — no new dialog needed.
 */
export function ActionNoteDialog({
  assignmentId,
  config,
  onClose,
}: ActionNoteDialogProps) {
  const [note, setNote] = useState("");
  const act = useAssignmentAction(assignmentId);

  const confirm = () => {
    if (!config) return;
    if (config.note === "required" && note.trim().length < 10) return;
    act.mutate(
      { action: config.action, note: note.trim() || undefined },
      {
        onSuccess: () => {
          onClose();
          setNote("");
        },
      },
    );
  };

  return (
    <Dialog open={Boolean(config)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>

        {config && config.note !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="action-note">
              Note
              {config.note === "optional" && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (optional)
                </span>
              )}
            </Label>
            <textarea
              id="action-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder={
                config.note === "required"
                  ? "Explain what needs to change (min 10 characters)…"
                  : "Add context for the timeline…"
              }
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
            />
            {config.note === "required" && note.trim().length < 10 && (
              <p className="text-muted-foreground text-xs">
                At least 10 characters required.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={act.isPending}>
            Cancel
          </Button>
          <Button
            variant={config?.destructive ? "destructive" : "default"}
            onClick={confirm}
            disabled={
              act.isPending ||
              (config?.note === "required" && note.trim().length < 10)
            }
          >
            {act.isPending && <Loader2 className="size-4 animate-spin" />}
            {config?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
