"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useForgotPassword } from "../hooks/use-password-reset";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../validation";

/** Request a password-reset link. Always shows a neutral success state. */
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    forgot.mutate(values.email, {
      onSuccess: () => setSent(true),
      onError: (error) => form.setError("root", { message: error.message }),
    });
  });

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            If an account exists for{" "}
            <span className="text-foreground font-medium">
              {form.getValues("email")}
            </span>
            , we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href={ROUTES.login}>
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  const { errors } = form.formState;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-sm" role="alert">
              {errors.email.message}
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

        <Button type="submit" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          <Link
            href={ROUTES.login}
            className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
