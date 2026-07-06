"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
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
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { useCreateAssignment } from "../hooks/use-assignments";
import {
  createAssignmentSchema,
  type CreateAssignmentFormValues,
} from "../validation";

/**
 * The client's "place your brief" form. On success the client lands on the
 * order's detail page where the timeline starts and the PM takes over.
 */
export function OrderForm() {
  const router = useRouter();
  const createAssignment = useCreateAssignment();

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: { title: "", subject: "", description: "", deadline: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    createAssignment.mutate(
      {
        title: values.title,
        subject: values.subject,
        description: values.description,
        deadline: new Date(values.deadline).toISOString(),
      },
      {
        onSuccess: (assignment) => {
          router.replace(`/assignments/${assignment.id}`);
        },
        onError: (error) => {
          applyFieldErrors(error, form.setError);
          if (!error.isValidationError) {
            form.setError("root", { message: error.message });
          }
        },
      },
    );
  });

  const { errors } = form.formState;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Tell us what you need</CardTitle>
        <CardDescription>
          A manager reviews your brief and matches you with the right specialist
          — usually the same day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="order-title">Title</Label>
            <Input
              id="order-title"
              placeholder="e.g. Market analysis report — consumer trends"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-sm" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-subject">Subject / field</Label>
              <Input
                id="order-subject"
                placeholder="e.g. Business, Psychology…"
                aria-invalid={Boolean(errors.subject)}
                {...form.register("subject")}
              />
              {errors.subject && (
                <p className="text-destructive text-sm" role="alert">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-deadline">Deadline</Label>
              <Input
                id="order-deadline"
                type="datetime-local"
                aria-invalid={Boolean(errors.deadline)}
                {...form.register("deadline")}
              />
              {errors.deadline && (
                <p className="text-destructive text-sm" role="alert">
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-description">Requirements</Label>
            <textarea
              id="order-description"
              rows={7}
              placeholder="Word count, formatting style (APA/MLA/Harvard), sources required, marking rubric, anything your expert should know…"
              aria-invalid={Boolean(errors.description)}
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-sm" role="alert">
                {errors.description.message}
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createAssignment.isPending}
          >
            {createAssignment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Place order
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            No payment is taken now — your manager confirms scope and price with
            you first.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
