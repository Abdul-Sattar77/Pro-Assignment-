"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { BookOpen, FileText, Loader2, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCurrentUser } from "@/features/auth";
import { useCreateAssignment } from "../hooks/use-assignments";
import {
  ACADEMIC_LEVEL_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  REFERENCING_STYLE_OPTIONS,
} from "../constants";
import {
  createAssignmentSchema,
  type CreateAssignmentFormValues,
} from "../validation";

/** Blank optional strings mean "not provided" — send undefined, not "". */
function orNull(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

function SectionHeader({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof UserRound;
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full">
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Step {step}
        </p>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

/**
 * Structured assignment submission form. Grouped into Student details,
 * Assignment details, and Additional information so every academic attribute
 * lands in its own field — powering search, filters, and reports downstream.
 * On success the student lands on the assignment's detail page.
 */
export function OrderForm() {
  const router = useRouter();
  const createAssignment = useCreateAssignment();
  const { data: user } = useCurrentUser();

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: "",
      subject: "",
      type: "",
      academic_level: "",
      course: "",
      university: user?.university ?? "",
      word_count: "",
      referencing_style: "",
      priority: "standard",
      deadline: "",
      contact_phone: "",
      contact_whatsapp: "",
      description: "",
    },
  });

  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    const trimmedWords = values.word_count?.trim();
    const wordCount = trimmedWords ? Number(trimmedWords) : undefined;

    createAssignment.mutate(
      {
        title: values.title,
        subject: values.subject,
        type: values.type ? values.type : undefined,
        academic_level: values.academic_level
          ? values.academic_level
          : undefined,
        course: orNull(values.course),
        university: orNull(values.university),
        word_count: wordCount,
        referencing_style: orNull(values.referencing_style),
        priority: values.priority ? values.priority : "standard",
        contact_phone: orNull(values.contact_phone),
        contact_whatsapp: orNull(values.contact_whatsapp),
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

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-6"
      noValidate
    >
      {/* 1 — Student details */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <SectionHeader
            icon={UserRound}
            step={1}
            title="Student details"
            description="How we reach you about this assignment."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={user?.name ?? ""} readOnly disabled />
              <p className="text-muted-foreground text-xs">
                From your student account.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly disabled />
              <p className="text-muted-foreground text-xs">
                Updates are sent here.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone (optional)</Label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="e.g. +44 7700 900000"
                aria-invalid={Boolean(errors.contact_phone)}
                {...form.register("contact_phone")}
              />
              <FieldError message={errors.contact_phone?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_whatsapp">WhatsApp (optional)</Label>
              <Input
                id="contact_whatsapp"
                type="tel"
                placeholder="e.g. +44 7700 900000"
                aria-invalid={Boolean(errors.contact_whatsapp)}
                {...form.register("contact_whatsapp")}
              />
              <FieldError message={errors.contact_whatsapp?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2 — Assignment details */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <SectionHeader
            icon={BookOpen}
            step={2}
            title="Assignment details"
            description="The specifics your expert needs to scope the work."
          />

          <div className="space-y-2">
            <Label htmlFor="title">Assignment title</Label>
            <Input
              id="title"
              placeholder="e.g. Market analysis report — consumer trends"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Assignment type</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.type?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject / field</Label>
              <Input
                id="subject"
                placeholder="e.g. Business, Psychology…"
                aria-invalid={Boolean(errors.subject)}
                {...form.register("subject")}
              />
              <FieldError message={errors.subject?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course / module (optional)</Label>
              <Input
                id="course"
                placeholder="e.g. BSc Marketing — MKT301"
                aria-invalid={Boolean(errors.course)}
                {...form.register("course")}
              />
              <FieldError message={errors.course?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University (optional)</Label>
              <Input
                id="university"
                placeholder="e.g. University of Manchester"
                aria-invalid={Boolean(errors.university)}
                {...form.register("university")}
              />
              <FieldError message={errors.university?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_level">Academic level</Label>
              <Controller
                control={form.control}
                name="academic_level"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="academic_level" className="w-full">
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.academic_level?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word_count">Word count (optional)</Label>
              <Input
                id="word_count"
                type="number"
                min={0}
                placeholder="e.g. 2500"
                aria-invalid={Boolean(errors.word_count)}
                {...form.register("word_count")}
              />
              <FieldError message={errors.word_count?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencing_style">
                Referencing style (optional)
              </Label>
              <Controller
                control={form.control}
                name="referencing_style"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="referencing_style" className="w-full">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERENCING_STYLE_OPTIONS.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.referencing_style?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                aria-invalid={Boolean(errors.deadline)}
                {...form.register("deadline")}
              />
              <FieldError message={errors.deadline?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  {PRIORITY_OPTIONS.map((option) => {
                    const selected = field.value === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        aria-pressed={selected}
                        className={
                          "rounded-lg border px-4 py-3 text-left transition-colors " +
                          (selected
                            ? "border-primary bg-primary/5 ring-primary/30 ring-1"
                            : "border-border hover:border-primary/40")
                        }
                      >
                        <span className="block text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3 — Additional information */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <SectionHeader
            icon={FileText}
            step={3}
            title="Additional information"
            description="Requirements, marking rubric, and anything else that helps."
          />

          <div className="space-y-2">
            <Label htmlFor="description">Detailed requirements</Label>
            <textarea
              id="description"
              rows={7}
              placeholder="Sources required, marking rubric, structure, tone, anything your expert should know…"
              aria-invalid={Boolean(errors.description)}
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              {...form.register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <p className="text-muted-foreground bg-muted/40 rounded-md border px-3 py-2 text-xs">
            Have briefs, reference files, images, or voice notes? Submit this
            form first — you can attach files to the assignment on the next
            screen.
          </p>
        </CardContent>
      </Card>

      {errors.root && (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
          role="alert"
        >
          {errors.root.message}
        </div>
      )}

      <div className="space-y-3">
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
          Submit assignment
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          No payment is taken now — your manager confirms scope and price with
          you first.
        </p>
      </div>
    </form>
  );
}
