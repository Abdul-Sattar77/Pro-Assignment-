"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useResetPassword } from "../hooks/use-password-reset";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../validation";

/** Set a new password from an emailed link (token + email come from the URL). */
export function ResetPasswordForm() {
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const reset = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    reset.mutate(
      { token, email, ...values },
      {
        onSuccess: () => setDone(true),
        onError: (error) => form.setError("root", { message: error.message }),
      },
    );
  });

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-success/10 text-success mx-auto flex size-12 items-center justify-center rounded-full">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Password reset complete
          </h1>
          <p className="text-muted-foreground text-sm">
            Your password has been updated. You can now sign in with it.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={ROUTES.login}>Go to sign in</Link>
        </Button>
      </div>
    );
  }

  const invalidLink = !token || !email;
  const { errors } = form.formState;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Set a new password
        </h1>
        <p className="text-muted-foreground text-sm">
          {invalidLink
            ? "This reset link is incomplete. Please request a new one."
            : `Resetting the password for ${email}.`}
        </p>
      </div>

      {invalidLink ? (
        <Button variant="outline" asChild className="w-full">
          <Link href={ROUTES.forgotPassword}>Request a new link</Link>
        </Button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
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
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      )}
    </div>
  );
}
