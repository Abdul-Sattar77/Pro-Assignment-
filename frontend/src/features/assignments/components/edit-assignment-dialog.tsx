"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Edit3 } from "lucide-react";
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
import { useUpdateAssignment } from "../hooks/use-assignments";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import {
  ASSIGNMENT_PRIORITY,
  type Assignment,
  type AssignmentPriority,
} from "../types";

const editAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(180),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(120),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(10000),
  deadline: z.string().refine(
    (val) => {
      if (!val) return false;
      const d = new Date(val);
      return !isNaN(d.getTime()) && d.getTime() > Date.now() - 60000; // should be in the future or current
    },
    {
      message: "Deadline must be valid and in the future.",
    },
  ),
  priority: z.nativeEnum(ASSIGNMENT_PRIORITY),
  word_count: z.preprocess(
    (val) => (val === "" || val === undefined ? null : Number(val)),
    z
      .number()
      .min(1, "Word count must be at least 1")
      .max(100000)
      .nullable()
      .optional(),
  ),
  notes: z.string().max(10000).nullable().optional(),
  client_price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Price cannot be negative").optional(),
  ),
  writer_cost: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Cost cannot be negative").optional(),
  ),
  discount: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Discount cannot be negative").optional(),
  ),
  net_profit: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional(),
  ),
});

type EditAssignmentFormValues = z.infer<typeof editAssignmentSchema>;

interface EditAssignmentDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toLocalDatetimeString(dateString?: string | null) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Dialog for editing an assignment's details.
 * Restricted to staff (Admin / PM).
 */
export function EditAssignmentDialog({
  assignment,
  open,
  onOpenChange,
}: EditAssignmentDialogProps) {
  const updateAssignment = useUpdateAssignment(assignment.id);

  const form = useForm<EditAssignmentFormValues>({
    // preprocess() fields widen the resolver's input type to unknown; the cast
    // reconciles it with the inferred output type (runtime behaviour is correct).
    resolver: zodResolver(
      editAssignmentSchema,
    ) as unknown as Resolver<EditAssignmentFormValues>,
    defaultValues: {
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      deadline: toLocalDatetimeString(assignment.deadline),
      priority: assignment.priority ?? ASSIGNMENT_PRIORITY.STANDARD,
      word_count: assignment.wordCount ?? undefined,
      notes: assignment.notes ?? "",
      client_price: assignment.clientPrice,
      writer_cost: assignment.writerCost,
      discount: assignment.discount,
      net_profit: assignment.netProfit,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      deadline: new Date(values.deadline).toISOString(),
    };

    updateAssignment.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="text-primary size-5" />
            Edit Assignment Details
          </DialogTitle>
          <DialogDescription>
            Update metadata, deadline, priority, and guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              type="text"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-xs" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subject">Subject</Label>
            <Input
              id="edit-subject"
              type="text"
              aria-invalid={Boolean(errors.subject)}
              {...form.register("subject")}
            />
            {errors.subject && (
              <p className="text-destructive text-xs" role="alert">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">
              Brief Description / Requirements
            </Label>
            <textarea
              id="edit-description"
              rows={4}
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="datetime-local"
                aria-invalid={Boolean(errors.deadline)}
                {...form.register("deadline")}
              />
              {errors.deadline && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.deadline.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) =>
                  form.setValue("priority", value as AssignmentPriority)
                }
              >
                <SelectTrigger id="edit-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSIGNMENT_PRIORITY).map(([key, val]) => (
                    <SelectItem key={key} value={val}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-word-count">Word Count</Label>
            <Input
              id="edit-word-count"
              type="number"
              placeholder="e.g. 1500"
              aria-invalid={Boolean(errors.word_count)}
              {...form.register("word_count")}
            />
            {errors.word_count && (
              <p className="text-destructive text-xs" role="alert">
                {errors.word_count.message}
              </p>
            )}
          </div>

          <div className="bg-muted/20 space-y-4 rounded-xl border p-4">
            <h3 className="font-semibold tracking-tight">Cost Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client-price">Client Price ($)</Label>
                <Input
                  id="edit-client-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.client_price)}
                  {...form.register("client_price")}
                />
                {errors.client_price && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.client_price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-writer-cost">Writer Cost ($)</Label>
                <Input
                  id="edit-writer-cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.writer_cost)}
                  {...form.register("writer_cost")}
                />
                {errors.writer_cost && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.writer_cost.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Discount ($)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.discount)}
                  {...form.register("discount")}
                />
                {errors.discount && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.discount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-net-profit">Net Profit ($)</Label>
                <Input
                  id="edit-net-profit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.net_profit)}
                  {...form.register("net_profit")}
                />
                {errors.net_profit && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.net_profit.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Internal Notes (Staff Only)</Label>
            <textarea
              id="edit-notes"
              rows={3}
              placeholder="Staff notes for coordination..."
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
              }}
              disabled={updateAssignment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateAssignment.isPending}>
              {updateAssignment.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
