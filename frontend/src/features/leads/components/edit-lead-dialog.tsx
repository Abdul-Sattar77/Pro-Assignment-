"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useUpdateLead } from "../hooks/use-leads";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { LEAD_SOURCE, LEAD_STATUS, type Lead } from "../types";
import { SOURCE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants";

const editLeadSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: z.string().email("Invalid email address").max(255).or(z.literal("")),
    phone: z.string().max(50).optional().nullable(),
    source: z.nativeEnum(LEAD_SOURCE),
    status: z.nativeEnum(LEAD_STATUS),
    notes: z.string().max(5000).optional().nullable(),
    lostReason: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (
        data.status === LEAD_STATUS.LOST &&
        (!data.lostReason || data.lostReason.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "A lost reason is required when status is Lost.",
      path: ["lostReason"],
    },
  );

type EditLeadFormValues = z.infer<typeof editLeadSchema>;

interface EditLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
}: EditLeadDialogProps) {
  const updateLead = useUpdateLead(lead.id);

  const form = useForm<EditLeadFormValues>({
    resolver: zodResolver(editLeadSchema),
    defaultValues: {
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source,
      status: lead.status,
      notes: lead.notes || "",
      lostReason: lead.lostReason || "",
    },
  });

  // Keep form values in sync with the lead prop when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source,
        status: lead.status,
        notes: lead.notes || "",
        lostReason: lead.lostReason || "",
      });
    }
  }, [open, lead, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      email: values.email === "" ? null : values.email,
      phone: values.phone === "" ? null : values.phone,
      notes: values.notes === "" ? null : values.notes,
      lostReason: values.status === LEAD_STATUS.LOST ? values.lostReason : null,
    };

    updateLead.mutate(payload, {
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
  const currentStatus = form.watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="text-primary size-5" />
            Edit lead details
          </DialogTitle>
          <DialogDescription>
            Modify lead information, source, status, or notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="e.g. John Doe"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="e.g. john@example.com"
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone (Optional)</Label>
              <Input
                id="edit-phone"
                type="text"
                placeholder="e.g. +1234567890"
                aria-invalid={Boolean(errors.phone)}
                {...form.register("phone")}
              />
              {errors.phone && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.phone?.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-source">Lead Source</Label>
              <Controller
                control={form.control}
                name="source"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="edit-source" className="w-full">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.source && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.source.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="edit-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
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
          </div>

          {currentStatus === LEAD_STATUS.LOST && (
            <div className="space-y-2">
              <Label htmlFor="edit-lost-reason">Lost Reason</Label>
              <Input
                id="edit-lost-reason"
                type="text"
                placeholder="e.g. Price too high, chose competitor..."
                aria-invalid={Boolean(errors.lostReason)}
                {...form.register("lostReason")}
              />
              {errors.lostReason && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.lostReason.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <textarea
              id="edit-notes"
              rows={4}
              placeholder="Enter additional lead notes..."
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
              disabled={updateLead.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending && (
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
