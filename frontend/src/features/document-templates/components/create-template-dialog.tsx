"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Upload, CheckCircle2, Pencil } from "lucide-react";
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
import { useCreateTemplate, useUpdateTemplate } from "../hooks/use-templates";
import { TEMPLATE_CATEGORIES } from "../constants";
import { useUploadFile } from "@/features/files/hooks/use-files";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import type { DocumentTemplate } from "../types";

const createTemplateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(5000).optional(),
});

type CreateTemplateFormValues = z.infer<typeof createTemplateSchema>;

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateToEdit?: DocumentTemplate | null;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  templateToEdit,
}: CreateTemplateDialogProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const uploadFile = useUploadFile();

  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = Boolean(templateToEdit);

  const form = useForm<CreateTemplateFormValues>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      title: "",
      category: "template",
      description: "",
    },
  });

  useEffect(() => {
    if (templateToEdit) {
      form.reset({
        title: templateToEdit.title,
        category: templateToEdit.category,
        description: templateToEdit.description || "",
      });
      setUploadedFileId(templateToEdit.file?.id || null);
    } else {
      form.reset({
        title: "",
        category: "template",
        description: "",
      });
      setUploadedFileId(null);
    }
  }, [templateToEdit, form]);

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
      title: values.title,
      category: values.category,
      description: values.description || undefined,
      fileId: uploadedFileId,
    };

    if (isEditing && templateToEdit) {
      updateTemplate.mutate(
        { id: templateToEdit.id, payload },
        {
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
        },
      );
    } else {
      createTemplate.mutate(payload, {
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
    }
  });

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="text-primary size-5" />
            ) : (
              <Plus className="text-primary size-5" />
            )}
            {isEditing ? "Edit Document Template" : "Add Document Template"}
          </DialogTitle>
          <DialogDescription>
            Publish standard guides, briefing structures, or assignment
            templates for writers and clients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="template-title">Title</Label>
            <Input
              id="template-title"
              placeholder="e.g. Accounting Outline Format / Python Coding Standard"
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
            <Label htmlFor="template-category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="template-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-desc">Description / Instructions</Label>
            <textarea
              id="template-desc"
              rows={3}
              placeholder="Record any general tips or instructions..."
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
            <Label>Attach Template File (Optional)</Label>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="template-file-upload"
                className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
              >
                <Upload className="text-muted-foreground size-4" />
                <span>Upload PDF / Docx / Zip</span>
                <input
                  id="template-file-upload"
                  type="file"
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
                  <span>File attached</span>
                </div>
              )}
            </div>
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
              disabled={createTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createTemplate.isPending ||
                updateTemplate.isPending ||
                uploading
              }
            >
              {(createTemplate.isPending || updateTemplate.isPending) && (
                <Loader2 className="mr-1 size-4 animate-spin" />
              )}
              {isEditing ? "Save Changes" : "Add Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
