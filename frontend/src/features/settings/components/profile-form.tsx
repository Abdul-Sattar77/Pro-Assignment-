"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyFieldErrors,
  updateProfileSchema,
  useAuth,
  useUpdateProfile,
  type UpdateProfileFormValues,
} from "@/features/auth";

/** Edit your own name, email, and (for students) academic details. */
export function ProfileForm() {
  const { user, hasRole } = useAuth();
  const updateProfile = useUpdateProfile();
  const isClient = hasRole("client");

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      university: "",
      department: "",
      studyYear: "",
    },
  });

  // Prefill once the session user is available.
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        university: user.university ?? "",
        department: user.department ?? "",
        studyYear: user.studyYear ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = form.handleSubmit((values) => {
    updateProfile.mutate(values, {
      onError: (error) => {
        applyFieldErrors(error, form.setError, { study_year: "studyYear" });
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  const { errors } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
        <CardDescription>
          Update your account details. Your email is also your sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
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
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-sm" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {isClient && (
            <div className="space-y-5 border-t pt-5">
              <p className="text-muted-foreground text-sm font-medium">
                Academic details
              </p>
              <div className="space-y-2">
                <Label htmlFor="profile-university">University</Label>
                <Input
                  id="profile-university"
                  {...form.register("university")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-department">Department</Label>
                  <Input
                    id="profile-department"
                    {...form.register("department")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-year">Year of study</Label>
                  <Input id="profile-year" {...form.register("studyYear")} />
                </div>
              </div>
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

          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
