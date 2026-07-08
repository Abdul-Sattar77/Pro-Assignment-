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
import { formatMoney } from "../constants";
import { useSubmitPayment } from "../hooks/use-finance";
import type { Invoice } from "../types";

/** Client submits a payment reference for an invoice → awaiting verification. */
export function PaymentDialog({
  invoice,
  onClose,
}: {
  invoice: Invoice | null;
  onClose: () => void;
}) {
  const [reference, setReference] = useState("");
  const submit = useSubmitPayment();

  const confirm = () => {
    if (!invoice || reference.trim().length < 3) return;
    submit.mutate(
      { id: invoice.id, reference: reference.trim() },
      {
        onSuccess: () => {
          onClose();
          setReference("");
        },
      },
    );
  };

  return (
    <Dialog open={Boolean(invoice)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Submit payment</DialogTitle>
          <DialogDescription>
            {invoice &&
              `Invoice ${invoice.number} · ${formatMoney(invoice.amountCents, invoice.currency)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="payment-reference">Payment reference</Label>
          <Input
            id="payment-reference"
            placeholder="Transaction ID / receipt number"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            Enter your bank transfer reference or receipt number. Your manager
            verifies it, then the invoice is marked paid.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submit.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={submit.isPending || reference.trim().length < 3}
          >
            {submit.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
