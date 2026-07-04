"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";

/**
 * Public landing / entry screen. Real branded surface that also verifies the
 * design-system foundation (tokens, fonts, theme, motion). Expanded by the
 * marketing + auth work in later phases.
 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <LayoutGrid className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Prossignment
          </span>
        </div>
        <ThemeToggle />
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <motion.span
          variants={fadeIn}
          className="border-border bg-secondary text-muted-foreground mb-6 rounded-full border px-3 py-1 text-xs font-medium"
        >
          Assignment Management ERP
        </motion.span>

        <motion.h1
          variants={fadeIn}
          className="text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          One workspace for leads, assignments, files, and finance.
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="text-muted-foreground mt-5 max-w-xl text-base text-pretty"
        >
          Replace scattered chats and spreadsheets with a centralized,
          enterprise-grade platform built for your whole team.
        </motion.p>

        <motion.div variants={fadeIn} className="mt-8 flex items-center gap-3">
          <Button asChild size="lg">
            <Link href={ROUTES.login}>
              Sign in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      <footer className="text-muted-foreground mx-auto w-full max-w-6xl px-6 py-6 text-center text-xs">
        Prossignment Portal — Version 1
      </footer>
    </main>
  );
}
