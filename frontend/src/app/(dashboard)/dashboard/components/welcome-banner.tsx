"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth";
import { fadeIn } from "@/animations/variants";
import { Shield, Sparkles } from "lucide-react";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeBanner() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

  return (
    <motion.div
      variants={fadeIn}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/3 blur-3xl"
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
              {greeting()}
            </span>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              <span>System operational</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Manage your portal operations, track system activities, view performance indicators, and handle pending actions all from your dashboard control center.
          </p>
        </div>

        <div className="flex shrink-0 items-start md:self-center">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary capitalize shadow-xs"
          >
            <Shield className="size-3.5" />
            Admin Role
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
