"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRecordPayment, useInvoices } from "../hooks/use-finance";
import { useAssignments } from "@/features/assignments/hooks/use-assignments";
import { useUsers } from "@/features/users/hooks/use-users";
import { useUploadFile } from "@/features/files/hooks/use-files";
import { useAuth } from "@/features/auth";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { formatMoney } from "../constants";
import { PAYMENT_TYPE, type PaymentType } from "../types";
import { APP_CURRENCY } from "@/config/currency";

const recordPaymentSchema = z.object({
  assignmentId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.01, "Amount must be at least 0.01"),
  ),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentType: z.nativeEnum(PAYMENT_TYPE),
  notes: z.string().max(5000).optional(),
});

type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const recordPayment = useRecordPayment();
  const uploadFile = useUploadFile();

  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Lists for dropdown selections
  const { data: assignmentsData } = useAssignments({ perPage: 100 });
  const { data: invoicesData } = useInvoices({ perPage: 100 });
  const { data: usersData } = useUsers({ perPage: 100 });

  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(
      recordPaymentSchema,
    ) as unknown as Resolver<RecordPaymentFormValues>,
    defaultValues: {
      assignmentId: "",
      invoiceId: "",
      userId: "",
      amount: undefined,
      paymentMethod: "bank_transfer",
      paymentType: PAYMENT_TYPE.ADVANCE,
      notes: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadFile.mutateAsync({ file });
      setUploadedFileId(response.id);
    } catch (err) {
      console.error("File upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      assignmentId: values.assignmentId || null,
      invoiceId: values.invoiceId || null,
      userId: values.userId || (isAdmin ? null : user?.id),
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      paymentType: values.paymentType,
      proofFileId: uploadedFileId,
      verified: isAdmin, // Automatically verify if entered by Admin
      notes: values.notes || undefined,
    };

    recordPayment.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        setUploadedFileId(null);
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
  const assignments = assignmentsData?.assignments || [];
  const invoices = invoicesData?.invoices || [];
  const usersList = usersData?.users || [];
  const selectedPaymentType = form.watch("paymentType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-primary size-5" />
            Record Payment / Transaction
          </DialogTitle>
          <DialogDescription>
            Record client advance/partial payments, writer payouts, or general
            expenses. Attach transaction screenshots or receipts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Transaction Type</Label>
              <Controller
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="payment-type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PAYMENT_TYPE.ADVANCE}>
                        Advance Payment (Inflow)
                      </SelectItem>
                      <SelectItem value={PAYMENT_TYPE.PARTIAL}>
                        Partial Payment (Inflow)
                      </SelectItem>
                      <SelectItem value={PAYMENT_TYPE.BALANCE}>
                        Remaining Balance (Inflow)
                      </SelectItem>
                      {isAdmin && (
                        <>
                          <SelectItem value={PAYMENT_TYPE.WRITER_PAYOUT}>
                            Writer Payout (Outflow)
                          </SelectItem>
                          <SelectItem value={PAYMENT_TYPE.EXPENSE}>
                            Operational Expense (Outflow)
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentType && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.paymentType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="payment-method" className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentMethod && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">
                Amount ({APP_CURRENCY.code})
              </Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                aria-invalid={Boolean(errors.amount)}
                {...form.register("amount")}
              />
              {errors.amount && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {isAdmin && selectedPaymentType !== PAYMENT_TYPE.EXPENSE && (
              <div className="space-y-2">
                <Label htmlFor="payment-user">User (Client/Writer)</Label>
                <Controller
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger id="payment-user" className="w-full">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersList.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-assignment">
                Linked Assignment (Optional)
              </Label>
              <Controller
                control={form.control}
                name="assignmentId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger id="payment-assignment" className="w-full">
                      <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None / General</SelectItem>
                      {assignments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          #{a.id.substring(0, 8)} - {a.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-invoice">Linked Invoice (Optional)</Label>
              <Controller
                control={form.control}
                name="invoiceId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger id="payment-invoice" className="w-full">
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {invoices.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.number} ({formatMoney(i.amountCents, i.currency)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Transaction Proof (Receipt/Screenshot)</Label>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="proof-upload"
                className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
              >
                <Upload className="text-muted-foreground size-4" />
                <span>Choose Proof Image/PDF</span>
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Label>
              {uploading && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Loader2 className="size-3 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
              {uploadedFileId && !uploading && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3" />
                  <span>Proof attached</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes / Transaction Reference</Label>
            <textarea
              id="payment-notes"
              rows={3}
              placeholder="e.g. Bank Ref #992384729 / Client deposited advance..."
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
                setUploadedFileId(null);
              }}
              disabled={recordPayment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordPayment.isPending || uploading}
            >
              {recordPayment.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Record Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
