"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, AlertCircle } from "lucide-react";
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
import { useSubmitComplaint } from "../hooks/use-complaints";
import { useAssignments } from "@/features/assignments/hooks/use-assignments";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const submitComplaintSchema = z.object({
  assignmentId: z.string().optional().nullable(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(255),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(10000),
});

type SubmitComplaintFormValues = z.infer<typeof submitComplaintSchema>;

interface SubmitComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitComplaintDialog({
  open,
  onOpenChange,
}: SubmitComplaintDialogProps) {
  const submitComplaint = useSubmitComplaint();
  const { data: assignmentsData } = useAssignments({ perPage: 100 });

  const form = useForm<SubmitComplaintFormValues>({
    resolver: zodResolver(submitComplaintSchema),
    defaultValues: {
      assignmentId: "none",
      subject: "",
      description: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    submitComplaint.mutate(
      {
        assignmentId:
          values.assignmentId && values.assignmentId !== "none"
            ? values.assignmentId
            : null,
        subject: values.subject,
        description: values.description,
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
      },
    );
  });

  const { errors } = form.formState;
  const assignments = assignmentsData?.assignments || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-primary size-5" />
            Submit Complaint / Issue
          </DialogTitle>
          <DialogDescription>
            Submit an issue regarding assignment output, timeline conflicts, or
            write-up communication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="complaint-assignment">
              Linked Order / Assignment (Optional)
            </Label>
            <Controller
              control={form.control}
              name="assignmentId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "none"}
                >
                  <SelectTrigger id="complaint-assignment" className="w-full">
                    <SelectValue placeholder="Select assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      None / General Portal Issue
                    </SelectItem>
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
            <Label htmlFor="complaint-subject">Subject</Label>
            <Input
              id="complaint-subject"
              placeholder="e.g. Delayed draft submission / Wrong guidelines followed"
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
            <Label htmlFor="complaint-desc">Details of the Complaint</Label>
            <textarea
              id="complaint-desc"
              rows={4}
              placeholder="Please explain the details of the problem..."
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
              disabled={submitComplaint.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitComplaint.isPending}>
              {submitComplaint.isPending && (
                <Loader2 className="mr-1 size-4 animate-spin" />
              )}
              Submit Complaint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
