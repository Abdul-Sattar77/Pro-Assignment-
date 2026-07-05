"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const float = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: easeOut, delay: 0.35 },
  },
};

/**
 * Landing hero: headline, dual CTA, trust chips, and a floating product
 * preview composed from real UI primitives (no images). Background: radial
 * brand glows over a masked grid texture.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background: grid + glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_35%,transparent_80%)] [background-size:56px_56px] opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[840px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={item} className="mb-6 flex justify-center">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full px-3 py-1 text-xs"
            >
              <Sparkles className="text-primary size-3.5" />
              Trusted by hundreds of students & professionals
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-tight text-balance sm:text-6xl"
          >
            Expert help for every assignment,{" "}
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent dark:to-sky-400">
              delivered on time
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty"
          >
            Share your requirements, get matched with a vetted expert, track
            progress in real time, and receive polished work — all in one
            beautifully simple workspace.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" asChild className="h-12 px-7 text-base">
              <Link href={orderHref(isAuthed)}>
                Order Now
                <ArrowRight className="size-4.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-7 text-base"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="text-success size-4" />
              100% confidential
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="text-success size-4" />
              On-time, guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-success size-4" />
              Free revisions
            </span>
          </motion.div>
        </motion.div>

        {/* Floating product preview */}
        <motion.div
          variants={float}
          initial="hidden"
          animate="visible"
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div
            aria-hidden
            className="from-primary/25 absolute -inset-x-8 top-8 -bottom-6 rounded-[28px] bg-gradient-to-t to-transparent blur-2xl"
          />
          <div className="bg-card/80 relative rounded-2xl border p-2 shadow-lg backdrop-blur-sm">
            <div className="bg-background rounded-xl border">
              {/* Fake window chrome */}
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-green-400/80" />
                <span className="text-muted-foreground ml-3 text-xs">
                  Prossignment — your workspace
                </span>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3">
                {/* Assignment card */}
                <div className="bg-card rounded-lg border p-4 text-left">
                  <div className="flex items-center justify-between">
                    <FileText className="text-primary size-4.5" />
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                      In progress
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    Market Analysis Report
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Due in 3 days · Business
                  </p>
                  <div className="bg-secondary mt-3 h-1.5 overflow-hidden rounded-full">
                    <motion.div
                      className="bg-primary h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.1, ease: easeOut, delay: 0.9 }}
                    />
                  </div>
                </div>

                {/* Chat card */}
                <div className="bg-card rounded-lg border p-4 text-left">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-primary size-4.5" />
                    <p className="text-sm font-semibold">Live updates</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="bg-secondary max-w-[85%] rounded-lg rounded-tl-sm px-3 py-1.5 text-xs">
                      Draft chapter uploaded ✔
                    </div>
                    <div className="bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-lg rounded-tr-sm px-3 py-1.5 text-xs">
                      Looks great — proceed!
                    </div>
                  </div>
                </div>

                {/* Delivered card */}
                <div className="bg-card rounded-lg border p-4 text-left">
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className="text-success size-4.5" />
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">
                      Delivered
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">Psychology Essay</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Rated ★★★★★ by you
                  </p>
                  <p className="text-success mt-3 text-xs font-medium">
                    Completed 2 days early
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
