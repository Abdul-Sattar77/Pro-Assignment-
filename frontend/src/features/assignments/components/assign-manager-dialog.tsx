"use client";

import { useState } from "react";
import { Loader2, UserCog } from "lucide-react";
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
import { useAssignManager } from "../hooks/use-assignments";

interface AssignManagerDialogProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Admin action: pick a project manager and assign them to this order.
 * Managers come from the Users API (filter[role]=project_manager).
 */
export function AssignManagerDialog({
  assignmentId,
  open,
  onOpenChange,
}: AssignManagerDialogProps) {
  const [managerId, setManagerId] = useState("");
  const { data, isPending: loadingManagers } = useUsers({
    role: "project_manager",
    status: "active",
    perPage: 100,
  });
  const assign = useAssignManager(assignmentId);

  const managers = data?.users ?? [];

  const confirm = () => {
    if (!managerId) return;
    assign.mutate(
      { managerId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setManagerId("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="text-primary size-5" />
            Assign a project manager
          </DialogTitle>
          <DialogDescription>
            The project manager will oversee and coordinate this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Project Manager</Label>
          <Select value={managerId} onValueChange={setManagerId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loadingManagers ? "Loading managers…" : "Select a manager"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {managers.length === 0 && !loadingManagers && (
                <p className="text-muted-foreground px-3 py-2 text-sm">
                  No active project managers found.
                </p>
              )}
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name}
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
          <Button onClick={confirm} disabled={!managerId || assign.isPending}>
            {assign.isPending && <Loader2 className="size-4 animate-spin" />}
            Assign manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
