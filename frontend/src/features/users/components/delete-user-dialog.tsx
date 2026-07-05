"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteUser } from "../hooks/use-users";
import type { UserListItem } from "../types";

interface DeleteUserDialogProps {
  user: UserListItem | null;
  onClose: () => void;
}

/** Destructive confirmation for user removal (soft delete on the backend). */
export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const confirm = () => {
    if (!user) return;
    deleteUser.mutate(user, { onSuccess: onClose });
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="bg-destructive/10 text-destructive mx-auto flex size-11 items-center justify-center rounded-full">
            <TriangleAlert className="size-5" />
          </div>
          <DialogTitle className="text-center">Delete user?</DialogTitle>
          <DialogDescription className="text-center">
            <span className="text-foreground font-medium">{user?.name}</span>{" "}
            will lose access immediately. This can be reversed by an
            administrator (accounts are archived, not erased).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
