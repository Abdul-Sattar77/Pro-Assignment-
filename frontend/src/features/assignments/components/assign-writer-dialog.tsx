"use client";

import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/features/users";
import { useAssignWriter } from "../hooks/use-assignments";

interface AssignWriterDialogProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PM action: pick an active writer and assign the order. Writers come from
 * the Users API (filter[role]=writer, active only).
 */
export function AssignWriterDialog({
  assignmentId,
  open,
  onOpenChange,
}: AssignWriterDialogProps) {
  const [writerId, setWriterId] = useState("");
  const { data, isPending: loadingWriters } = useUsers({
    role: "writer",
    status: "active",
    perPage: 100,
  });
  const assign = useAssignWriter(assignmentId);

  const writers = data?.users ?? [];

  const confirm = () => {
    if (!writerId) return;
    assign.mutate(
      { writerId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setWriterId("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="text-primary size-5" />
            Assign a writer
          </DialogTitle>
          <DialogDescription>
            The writer is notified and must accept before work begins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Writer</Label>
          <Select value={writerId} onValueChange={setWriterId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loadingWriters ? "Loading writers…" : "Select a writer"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {writers.length === 0 && !loadingWriters && (
                <p className="text-muted-foreground px-3 py-2 text-sm">
                  No active writers — add one in Users.
                </p>
              )}
              {writers.map((writer) => (
                <SelectItem key={writer.id} value={writer.id}>
                  {writer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assign.isPending}
          >
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!writerId || assign.isPending}>
            {assign.isPending && <Loader2 className="size-4 animate-spin" />}
            Assign writer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
