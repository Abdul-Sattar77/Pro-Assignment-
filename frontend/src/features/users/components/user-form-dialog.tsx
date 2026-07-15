"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { ASSIGNABLE_ROLES } from "../constants";
import { useCreateUser, useUpdateUser } from "../hooks/use-users";
import type { UserListItem } from "../types";
import { userFormSchema, type UserFormValues } from "../validation";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this user; otherwise it creates one. */
  user?: UserListItem | null;
}

/**
 * Create/edit user dialog. Single role selection (a user holds one role in
 * this product); password is required on create, optional on edit.
 */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEdit = Boolean(user);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const pending = createUser.isPending || updateUser.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(isEdit)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      availability: "available",
      expertise: "",
      notes: "",
    },
  });

  // Sync form contents whenever the dialog opens for a different target.
  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        role: user?.roles[0] ?? "",
        availability: user?.availability ?? "available",
        expertise: user?.expertise ?? "",
        notes: user?.notes ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const onSubmit = form.handleSubmit((values) => {
    const handleError = (error: Parameters<typeof applyFieldErrors>[0]) => {
      applyFieldErrors(error, form.setError);
      if (!error.isValidationError) {
        form.setError("root", { message: error.message });
      }
    };

    if (isEdit && user) {
      updateUser.mutate(
        {
          id: user.id,
          payload: {
            name: values.name,
            email: values.email,
            password: values.password || undefined,
            roles: [values.role],
            availability:
              values.role === "writer" ? values.availability : undefined,
            expertise: values.role === "writer" ? values.expertise : undefined,
            notes: values.role === "client" ? values.notes : undefined,
          },
        },
        { onSuccess: () => onOpenChange(false), onError: handleError },
      );
    } else {
      createUser.mutate(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          roles: [values.role],
          availability:
            values.role === "writer" ? values.availability : undefined,
          expertise: values.role === "writer" ? values.expertise : undefined,
          notes: values.role === "client" ? values.notes : undefined,
        },
        { onSuccess: () => onOpenChange(false), onError: handleError },
      );
    }
  });

  const { errors } = form.formState;
  const selectedRole = form.watch("role");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update account details, role, or password."
              : "Create a team or client account and assign a role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="user-name">Full name</Label>
            <Input
              id="user-name"
              placeholder="Jane Smith"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-sm" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="jane@company.com"
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              Password
              {isEdit && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (leave blank to keep current)
                </span>
              )}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              placeholder={isEdit ? "••••••••" : "At least 8 characters"}
              aria-invalid={Boolean(errors.password)}
              {...form.register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={Boolean(errors.role)}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-destructive text-sm" role="alert">
                {errors.role.message}
              </p>
            )}
          </div>

          {selectedRole === "writer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="writer-availability">Availability Status</Label>
                <Controller
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <Select
                      value={field.value || "available"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="writer-availability">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="writer-expertise">
                  Writer Expertise / Niches
                </Label>
                <textarea
                  id="writer-expertise"
                  rows={2}
                  placeholder="e.g. Accounting, Finance, Python, Essays..."
                  className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
                  {...form.register("expertise")}
                />
              </div>
            </>
          )}

          {selectedRole === "client" && (
            <div className="space-y-2">
              <Label htmlFor="client-notes">Client Specific Notes</Label>
              <textarea
                id="client-notes"
                rows={3}
                placeholder="e.g. Preferred writing style, discounts, or special instructions..."
                className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
                {...form.register("notes")}
              />
            </div>
          )}

          {errors.root && (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
