"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, FilePlus } from "lucide-react";
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
import { useCreateInvoice } from "../hooks/use-finance";
import { useAssignments } from "@/features/assignments/hooks/use-assignments";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const createInvoiceSchema = z.object({
  assignmentId: z.string().min(1, "Please select an assignment"),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Amount must be at least 0").optional()
  ),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().max(5000).optional(),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const createInvoice = useCreateInvoice();
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useAssignments({
    perPage: 100,
  });

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      assignmentId: "",
      amount: undefined,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createInvoice.mutate(
      {
        assignmentId: values.assignmentId,
        amount: values.amount,
        dueDate: values.dueDate,
        notes: values.notes || undefined,
      },
      {
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
      }
    );
  });

  const { errors } = form.formState;
  const assignments = assignmentsData?.assignments || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="text-primary size-5" />
            Generate Invoice
          </DialogTitle>
          <DialogDescription>
            Generate a clean client invoice for an assignment. Leave the amount blank to use the assignment's client price minus discount automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="invoice-assignment">Select Assignment</Label>
            <Controller
              control={form.control}
              name="assignmentId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="invoice-assignment" className="w-full">
                    <SelectValue placeholder={isLoadingAssignments ? "Loading assignments..." : "Select an assignment"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        #{assignment.id.substring(0, 8)} - {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assignmentId && (
              <p className="text-destructive text-xs" role="alert">
                {errors.assignmentId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-amount">Custom Amount (Optional)</Label>
              <Input
                id="invoice-amount"
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                aria-invalid={Boolean(errors.amount)}
                {...form.register("amount")}
              />
              {errors.amount && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-due-date">Due Date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                aria-invalid={Boolean(errors.dueDate)}
                {...form.register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-notes">Notes / Instructions (Optional)</Label>
            <textarea
              id="invoice-notes"
              rows={3}
              placeholder="e.g. Please pay advance via Bank Transfer to account XXXXX..."
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
              disabled={createInvoice.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Generate Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
