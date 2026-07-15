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
      className="border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm md:p-8"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="bg-primary/5 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-primary/3 pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono text-xs font-semibold tracking-wider uppercase">
              {greeting()}
            </span>
            <span className="text-muted-foreground">•</span>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Sparkles className="text-primary size-3.5 animate-pulse" />
              <span>System operational</span>
            </div>
          </div>

          <h1 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Manage your portal operations, track system activities, view
            performance indicators, and handle pending actions all from your
            dashboard control center.
          </p>
        </div>

        <div className="flex shrink-0 items-start md:self-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold capitalize shadow-xs"
          >
            <Shield className="size-3.5" />
            Admin Role
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
