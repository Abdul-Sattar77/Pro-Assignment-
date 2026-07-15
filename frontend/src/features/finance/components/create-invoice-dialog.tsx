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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignments } from "@/features/assignments";
import { useCreateInvoice } from "../hooks/use-finance";

/**
 * Staff raises an invoice against an order. The client is taken from the
 * selected order, so there's no separate client picker.
 */
export function CreateInvoiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [assignmentId, setAssignmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { data: orders } = useAssignments({ perPage: 100 });
  const create = useCreateInvoice();

  const reset = () => {
    setAssignmentId("");
    setAmount("");
    setDescription("");
  };

  const submit = () => {
    const value = Number.parseFloat(amount);
    if (!assignmentId || Number.isNaN(value) || value <= 0) return;
    create.mutate(
      { assignmentId, amount: value, description: description || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Raise an invoice for an assignment. The student is billed
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment</Label>
            <Select value={assignmentId} onValueChange={setAssignmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an assignment" />
              </SelectTrigger>
              <SelectContent>
                {orders?.assignments.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.title}
                    {order.client ? ` — ${order.client.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-amount">Amount (USD)</Label>
            <Input
              id="invoice-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="150.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-description">Description (optional)</Label>
            <Input
              id="invoice-description"
              placeholder="e.g. Dissertation — Chapter 3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={create.isPending || !assignmentId || !amount}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Create invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
