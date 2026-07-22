"use client";

import { useState } from "react";
import { Loader2, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function formatPkr(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

/**
 * Writer self-service panel: total earnings + average rating (read-only), plus
 * editable availability and expertise. Writer-only — gate the render site with
 * <Can role="writer">. Saves through the shared PATCH /profile endpoint.
 */
export function WriterProfileCard() {
  const { data: user } = useCurrentUser();
  const update = useUpdateProfile();

  const [availability, setAvailability] = useState<WriterAvailability>(
    user?.availability ?? "available",
  );
  const [expertise, setExpertise] = useState(user?.expertise ?? "");

  // This card only renders inside <Can role="writer">, which gates on the
  // already-loaded session user, so `user` is present at mount.
  if (!user) return null;

  const dirty =
    availability !== (user.availability ?? "available") ||
    expertise.trim() !== (user.expertise ?? "").trim();

  const save = () => {
    update.mutate({
      name: user.name,
      email: user.email,
      availability,
      expertise: expertise.trim() || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Writer profile</CardTitle>
        <CardDescription>
          Your earnings, rating, and how you take on work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earnings + rating */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <Wallet className="size-4" />
              Total earnings
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatPkr(user.totalEarnings)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <Star className="size-4" />
              Average rating
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {user.averageRating ? user.averageRating.toFixed(1) : "—"}
              {user.averageRating ? (
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  / 5
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label>Availability</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAvailability(option.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  availability === option.value
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

        {/* Expertise */}
        <div className="space-y-2">
          <Label htmlFor="writer-expertise">Expertise &amp; subjects</Label>
          <textarea
            id="writer-expertise"
            rows={3}
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="e.g. Computer Science, Business, dissertations; Python, Java; APA/Harvard"
            className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />
          <p className="text-muted-foreground text-xs">
            Project managers use this to match you to the right assignments.
          </p>
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
