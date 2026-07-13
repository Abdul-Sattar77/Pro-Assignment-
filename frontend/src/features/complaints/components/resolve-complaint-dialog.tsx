"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
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
import { useResolveComplaint } from "../hooks/use-complaints";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const resolveComplaintSchema = z.object({
  status: z.enum(["in_progress", "resolved", "dismissed"]),
  resolution: z.string().min(5, "Resolution details must be at least 5 characters.").max(10000),
});

type ResolveComplaintFormValues = z.infer<typeof resolveComplaintSchema>;

interface ResolveComplaintDialogProps {
  complaintId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResolveComplaintDialog({ complaintId, open, onOpenChange }: ResolveComplaintDialogProps) {
  const resolveComplaint = useResolveComplaint(complaintId);

  const form = useForm<ResolveComplaintFormValues>({
    resolver: zodResolver(resolveComplaintSchema),
    defaultValues: {
      status: "resolved",
      resolution: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    resolveComplaint.mutate(
      {
        status: values.status,
        resolution: values.resolution,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-primary size-5" />
            Resolve Complaint
          </DialogTitle>
          <DialogDescription>
            Update the resolution state of this complaint and record notes for the client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="resolve-status">Resolution State</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="resolve-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Mark Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismiss Complaint</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolve-notes">Resolution Details / Notes</Label>
            <textarea
              id="resolve-notes"
              rows={4}
              placeholder="e.g. Discussed with writer, revision was submitted and sent to client..."
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.resolution)}
              {...form.register("resolution")}
            />
            {errors.resolution && (
              <p className="text-destructive text-xs" role="alert">
                {errors.resolution.message}
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
              disabled={resolveComplaint.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resolveComplaint.isPending}>
              {resolveComplaint.isPending && (
                <Loader2 className="size-4 animate-spin mr-1" />
              )}
              Update Resolution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
