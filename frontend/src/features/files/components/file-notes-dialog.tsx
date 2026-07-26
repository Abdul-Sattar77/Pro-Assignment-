"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { StickyNote, Save, Loader2, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUpdateFileNotes } from "../hooks/use-files";
import type { AppFile } from "../types";

const schema = z.object({
  notes: z.string().max(2000).optional(),
  version: z.coerce.number().int().min(1).max(999).optional(),
});
type FormValues = z.infer<typeof schema>;

interface FileNotesDialogProps {
  file: AppFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileNotesDialog({ file, open, onOpenChange }: FileNotesDialogProps) {
  const updateNotes = useUpdateFileNotes(file.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      notes: file.notes || "",
      version: file.version ?? 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    updateNotes.mutate(
      { notes: values.notes ?? "", version: values.version ?? 1 },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="size-4 text-primary" />
            File Notes &amp; Version
          </DialogTitle>
          <DialogDescription className="text-xs truncate max-w-sm">
            {file.originalName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <Hash className="size-3" /> Version Number
            </Label>
            <Input
              type="number"
              min={1}
              max={999}
              {...form.register("version")}
              className="w-24 font-mono text-sm"
            />
            {form.formState.errors.version && (
              <p className="text-xs text-destructive">
                {form.formState.errors.version.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <StickyNote className="size-3" /> Internal Notes
            </Label>
            <Textarea
              placeholder="Add internal notes, instructions, or context about this file…"
              rows={5}
              className="resize-none text-sm"
              {...form.register("notes")}
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateNotes.isPending}
              className="gap-1.5"
            >
              {updateNotes.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Notes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
