"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVerifyPayment } from "../hooks/use-finance";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { PAYMENT_STATUS, type PaymentStatus } from "../types";

const verifyPaymentSchema = z.object({
  status: z.nativeEnum(PAYMENT_STATUS),
  notes: z.string().max(5000).optional(),
});

type VerifyPaymentFormValues = z.infer<typeof verifyPaymentSchema>;

interface VerifyPaymentDialogProps {
  paymentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyPaymentDialog({
  paymentId,
  open,
  onOpenChange,
}: VerifyPaymentDialogProps) {
  const verifyPayment = useVerifyPayment(paymentId);

  const form = useForm<VerifyPaymentFormValues>({
    resolver: zodResolver(verifyPaymentSchema),
    defaultValues: {
      status: PAYMENT_STATUS.VERIFIED,
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    verifyPayment.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        applyFieldErrors(error, form.setError);
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" />
            Verify Payment Proof
          </DialogTitle>
          <DialogDescription>
            Approve or reject this transaction. Verifying client inflow will
            automatically mark associated invoices as paid if the total paid
            amount is met.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="verify-status">Action</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="verify-status" className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PAYMENT_STATUS.VERIFIED}>
                      Approve & Verify
                    </SelectItem>
                    <SelectItem value={PAYMENT_STATUS.REJECTED}>
                      Reject / Decline Proof
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-destructive text-xs" role="alert">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-notes">Notes / Reason (Optional)</Label>
            <textarea
              id="verify-notes"
              rows={3}
              placeholder="e.g. Transaction confirmed in bank account / Proof was unreadable..."
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.notes)}
              {...form.register("notes")}
            />
            {errors.notes && (
              <p className="text-destructive text-xs" role="alert">
                {errors.notes.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={verifyPayment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={verifyPayment.isPending}>
              {verifyPayment.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Submit Verification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
