"use client";

import { useState } from "react";
import { Loader2, Star, Wallet, Briefcase } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useCurrentUser } from "../hooks/use-auth-queries";
import { useUpdateProfile } from "../hooks/use-profile";
import type { WriterAvailability } from "../types";

const AVAILABILITY: {
  value: WriterAvailability;
  label: string;
  dot: string;
}[] = [
  { value: "available", label: "Available", dot: "bg-emerald-500" },
  { value: "busy", label: "Busy", dot: "bg-amber-500" },
  { value: "away", label: "On leave", dot: "bg-muted-foreground" },
];

import { formatCurrency } from "@/config/currency";

interface FormState {
  availability: WriterAvailability;
  expertise: string;
  subjects: string;
  universities: string;
  codingLanguages: string;
  dissertationExperience: boolean;
  urgentCapable: boolean;
  maxWordCount: string;
  maxWorkload: string;
}

/**
 * Writer self-service panel: total earnings + rating + current workload
 * (read-only), plus editable availability, expertise, and structured profile
 * (subjects, universities, coding languages, dissertation/urgent capability,
 * max word count, max workload). Writer-only — gate with <Can role="writer">.
 * Saves through PATCH /profile (partial; never touches the admin `expertise`).
 */
export function WriterProfileCard() {
  const { data: user } = useCurrentUser();
  const update = useUpdateProfile();

  // This card only renders inside <Can role="writer">, which gates on the
  // already-loaded session user, so `user` is present at mount.
  const wp = user?.writerProfile ?? null;
  const initial: FormState = {
    availability: user?.availability ?? "available",
    expertise: user?.expertise ?? "",
    subjects: wp?.subjects ?? "",
    universities: wp?.universities ?? "",
    codingLanguages: wp?.codingLanguages ?? "",
    dissertationExperience: wp?.dissertationExperience ?? false,
    urgentCapable: wp?.urgentCapable ?? false,
    maxWordCount: wp?.maxWordCount != null ? String(wp.maxWordCount) : "",
    maxWorkload: wp?.maxWorkload != null ? String(wp.maxWorkload) : "",
  };

  const [form, setForm] = useState<FormState>(initial);

  if (!user) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = () => {
    update.mutate({
      name: user.name,
      email: user.email,
      availability: form.availability,
      expertise: form.expertise.trim() || null,
      writerProfile: {
        subjects: form.subjects.trim() || null,
        universities: form.universities.trim() || null,
        codingLanguages: form.codingLanguages.trim() || null,
        dissertationExperience: form.dissertationExperience,
        urgentCapable: form.urgentCapable,
        maxWordCount: form.maxWordCount.trim()
          ? Number(form.maxWordCount)
          : null,
        maxWorkload: form.maxWorkload.trim() ? Number(form.maxWorkload) : null,
      },
    });
  };

  const workloadLabel =
    form.maxWorkload.trim() && Number(form.maxWorkload) > 0
      ? `${user.currentWorkload ?? 0} / ${form.maxWorkload}`
      : String(user.currentWorkload ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Writer profile</CardTitle>
        <CardDescription>
          Your earnings, rating, and how you take on work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat
            icon={<Wallet className="size-4" />}
            label="Total earnings"
            value={formatCurrency(user.totalEarnings)}
          />
          <Stat
            icon={<Star className="size-4" />}
            label="Average rating"
            value={user.averageRating ? user.averageRating.toFixed(1) : "—"}
          />
          <Stat
            icon={<Briefcase className="size-4" />}
            label="Current workload"
            value={workloadLabel}
          />
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label>Availability</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set("availability", option.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  form.availability === option.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <span className={cn("size-2 rounded-full", option.dot)} />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Structured expertise */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="wp-subjects"
            label="Subjects"
            value={form.subjects}
            onChange={(v) => set("subjects", v)}
            placeholder="e.g. Computer Science, Business, Law"
          />
          <Field
            id="wp-universities"
            label="Universities handled"
            value={form.universities}
            onChange={(v) => set("universities", v)}
            placeholder="e.g. Oxford, LSE, MIT"
          />
          <Field
            id="wp-coding"
            label="Coding languages"
            value={form.codingLanguages}
            onChange={(v) => set("codingLanguages", v)}
            placeholder="e.g. Python, Java, SQL"
          />
          <Field
            id="wp-maxwords"
            label="Max word count"
            value={form.maxWordCount}
            onChange={(v) => set("maxWordCount", v.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 10000"
            inputMode="numeric"
          />
          <Field
            id="wp-maxload"
            label="Max workload (assignments)"
            value={form.maxWorkload}
            onChange={(v) => set("maxWorkload", v.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 5"
            inputMode="numeric"
          />
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-2">
          <Toggle
            active={form.dissertationExperience}
            onClick={() =>
              set("dissertationExperience", !form.dissertationExperience)
            }
          >
            Dissertation experience
          </Toggle>
          <Toggle
            active={form.urgentCapable}
            onClick={() => set("urgentCapable", !form.urgentCapable)}
          >
            Takes urgent tasks
          </Toggle>
        </div>

        {/* Freeform expertise */}
        <div className="space-y-2">
          <Label htmlFor="writer-expertise">Additional notes</Label>
          <textarea
            id="writer-expertise"
            rows={2}
            value={form.expertise}
            onChange={(e) => set("expertise", e.target.value)}
            placeholder="Anything else PMs should know when assigning work…"
            className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={!dirty || update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
