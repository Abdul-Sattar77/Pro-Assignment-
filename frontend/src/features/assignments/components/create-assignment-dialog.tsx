"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ClipboardPlus } from "lucide-react";
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
import { useCreateAssignment } from "../hooks/use-assignments";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const createAssignmentSchema = z.object({
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
      return (
        !isNaN(d.getTime()) &&
        d.getTime() > Date.now() + 2 * 60 * 60 * 1000 - 60000
      );
    },
    {
      message: "Deadline must be at least 2 hours in the future.",
    },
  ),
});

type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for creating an assignment (placing an order).
 * Used by Clients, PMs, and Admins.
 */
export function CreateAssignmentDialog({
  open,
  onOpenChange,
}: CreateAssignmentDialogProps) {
  const createAssignment = useCreateAssignment();

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      deadline: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      deadline: new Date(values.deadline).toISOString(),
    };

    createAssignment.mutate(payload, {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPlus className="text-primary size-5" />
            Place a new order
          </DialogTitle>
          <DialogDescription>
            Specify the requirements, subject, and deadline for the assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              type="text"
              placeholder="e.g. Comparative Analysis of Modern Cryptography"
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
            <Label htmlFor="create-subject">Subject</Label>
            <Input
              id="create-subject"
              type="text"
              placeholder="e.g. Computer Science, Literature, Finance"
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
            <Label htmlFor="create-description">
              Brief Description / Requirements
            </Label>
            <textarea
              id="create-description"
              rows={4}
              placeholder="Provide a detailed brief. Mention key topics, structure guidelines, formatting style (e.g. APA, Harvard)..."
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

          <div className="space-y-2">
            <Label htmlFor="create-deadline">Deadline</Label>
            <Input
              id="create-deadline"
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
              disabled={createAssignment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Place Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
