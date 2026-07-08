"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useRegister } from "../hooks/use-auth-queries";
import { applyFieldErrors } from "../utils/apply-field-errors";
import { registerSchema, type RegisterFormValues } from "../validation";

/**
 * Registration form. New accounts default to the Client role (backend
 * AuthService); staff accounts are provisioned by an admin.
 */
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      university: "",
      department: "",
      studyYear: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    register.mutate(values, {
      onError: (error) => {
        applyFieldErrors(error, form.setError, {
          password_confirmation: "passwordConfirmation",
          study_year: "studyYear",
        });
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          aria-invalid={Boolean(errors.email)}
          {...form.register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Academic profile */}
      <div className="space-y-2">
        <Label htmlFor="university">University</Label>
        <Input
          id="university"
          autoComplete="organization"
          placeholder="e.g. University of Manchester"
          aria-invalid={Boolean(errors.university)}
          {...form.register("university")}
        />
        {errors.university && (
          <p className="text-destructive text-sm" role="alert">
            {errors.university.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g. Business"
            aria-invalid={Boolean(errors.department)}
            {...form.register("department")}
          />
          {errors.department && (
            <p className="text-destructive text-sm" role="alert">
              {errors.department.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="studyYear">Year of study</Label>
          <Input
            id="studyYear"
            placeholder="e.g. 3rd year"
            aria-invalid={Boolean(errors.studyYear)}
            {...form.register("studyYear")}
          />
          {errors.studyYear && (
            <p className="text-destructive text-sm" role="alert">
              {errors.studyYear.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-10"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation">Confirm password</Label>
        <Input
          id="passwordConfirmation"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={Boolean(errors.passwordConfirmation)}
          {...form.register("passwordConfirmation")}
        />
        {errors.passwordConfirmation && (
          <p className="text-destructive text-sm" role="alert">
            {errors.passwordConfirmation.message}
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

      <Button type="submit" className="w-full" disabled={register.isPending}>
        {register.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
