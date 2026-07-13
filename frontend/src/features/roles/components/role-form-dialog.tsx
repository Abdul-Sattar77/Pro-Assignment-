"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield } from "lucide-react";
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
import { usePermissions, useCreateRole, useUpdateRole } from "../hooks/use-roles";
import type { Role } from "../types";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const roleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters.").max(255),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

const CORE_ROLES = ["admin", "project_manager", "writer", "client"];

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEdit = Boolean(role);
  const isCore = role ? CORE_ROLES.includes(role.name) : false;

  const { data: allPermissions, isLoading: loadingPermissions } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole(role?.id || "");

  const pending = createRole.isPending || updateRole.isPending;

  // Selected permission names array
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: role?.name ?? "",
      });
      setSelectedPermissions(role?.permissions ?? []);
    }
  }, [open, role, form]);

  const handleTogglePermission = (name: string, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, name] : prev.filter((p) => p !== name)
    );
  };

  const handleSelectAll = (category: string, selectAll: boolean) => {
    const categoryPermissions = groupedPermissions[category].map((p) => p.name);
    setSelectedPermissions((prev) => {
      const filtered = prev.filter((p) => !categoryPermissions.includes(p));
      return selectAll ? [...filtered, ...categoryPermissions] : filtered;
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: isCore ? undefined : values.name,
      permissions: selectedPermissions,
    };

    const handleError = (error: any) => {
      applyFieldErrors(error, form.setError);
      if (!error.isValidationError) {
        form.setError("root", { message: error.message });
      }
    };

    if (isEdit && role) {
      updateRole.mutate(payload, {
        onSuccess: () => onOpenChange(false),
        onError: handleError,
      });
    } else {
      createRole.mutate(payload, {
        onSuccess: () => onOpenChange(false),
        onError: handleError,
      });
    }
  });

  // Group Spatie permissions by resource prefix (first token before '.')
  const groupedPermissions: Record<string, { id: string; name: string }[]> = {};
  if (allPermissions) {
    allPermissions.forEach((p) => {
      const parts = p.name.split(".");
      const category = parts[0] || "general";
      if (!groupedPermissions[category]) {
        groupedPermissions[category] = [];
      }
      groupedPermissions[category].push(p);
    });
  }

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <span>{isEdit ? `Edit Role: ${role?.name}` : "Create New Role"}</span>
          </DialogTitle>
          <DialogDescription>
            Configure user group capabilities and sync granular authorization filters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto space-y-5 py-4 pr-1" noValidate>
          {!isCore ? (
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Code Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. content_reviewer"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-xs" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Core system role. The name is locked to safeguard internal system integrity, but permissions are editable.
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Permission Checklist</Label>
            {loadingPermissions ? (
              <div className="flex justify-center items-center py-10 gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading permission matrix...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedPermissions).map((category) => {
                  const items = groupedPermissions[category];
                  const allSelected = items.every((i) => selectedPermissions.includes(i.name));
                  return (
                    <div key={category} className="border rounded-md p-3 space-y-2 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                          {category} Management
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id={`select-all-${category}`}
                            checked={allSelected}
                            onChange={(e) => handleSelectAll(category, e.target.checked)}
                            className="size-4 rounded border-input bg-transparent text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          />
                          <Label htmlFor={`select-all-${category}`} className="text-[10px] cursor-pointer text-muted-foreground select-none">
                            Select All
                          </Label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                        {items.map((perm) => (
                          <div key={perm.id} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id={`perm-${perm.id}`}
                              checked={selectedPermissions.includes(perm.name)}
                              onChange={(e) => handleTogglePermission(perm.name, e.target.checked)}
                              className="size-4 rounded border-input bg-transparent text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-0.5 cursor-pointer"
                            />
                            <Label
                              htmlFor={`perm-${perm.id}`}
                              className="text-xs font-normal cursor-pointer select-none text-slate-650 dark:text-slate-300 leading-none"
                            >
                              {perm.name.replace(`${category}.`, "").replace("_", " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
        </form>

        <DialogFooter className="pt-2 border-t mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={pending || loadingPermissions}>
            {pending && <Loader2 className="size-4 animate-spin mr-1" />}
            {isEdit ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
