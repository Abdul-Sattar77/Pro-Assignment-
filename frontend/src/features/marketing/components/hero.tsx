"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut, delay },
  }),
};

/**
 * Editorial hero: asymmetric two-column composition. Left — oversized serif
 * statement with an italic accent line. Right — an "order ticket" artifact
 * (perforated docket) instead of the usual dashboard mockup.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-28">
      {/* Oversized ghost numeral */}
      <div
        aria-hidden
        className="text-foreground/[0.035] pointer-events-none absolute -top-10 right-0 font-serif text-[26rem] leading-none font-bold select-none lg:text-[34rem]"
      >
        A+
      </div>

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-16 px-6 lg:grid-cols-[1.25fr_1fr] lg:px-10">
        {/* Left — statement */}
        <div>
          <motion.p
            custom={0}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="text-muted-foreground flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase"
          >
            <span className="bg-primary inline-block size-2 rounded-full" />
            The assignment studio
          </motion.p>

          <h1 className="mt-6 font-serif text-5xl leading-[1.04] font-medium tracking-tight text-balance sm:text-7xl">
            <motion.span
              custom={0.08}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="block"
            >
              Serious work,
            </motion.span>
            <motion.span
              custom={0.18}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="text-primary block italic"
            >
              handled beautifully.
            </motion.span>
          </h1>

          <motion.p
            custom={0.3}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="text-muted-foreground mt-7 max-w-md text-lg leading-relaxed text-pretty"
          >
            Brief us once. A vetted specialist and a dedicated manager take it
            from there — drafts, revisions, and delivery, all tracked in your
            private studio.
          </motion.p>

          <motion.div
            custom={0.42}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center gap-6"
          >
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full px-8 text-base font-medium"
            >
              <Link href={orderHref(isAuthed)}>
                Place an order
                <ArrowUpRight className="size-5" />
              </Link>
            </Button>
            <a
              href="#process"
              className="text-foreground group flex items-center gap-2 text-sm font-medium"
            >
              <span className="border-foreground/25 group-hover:border-foreground flex size-10 items-center justify-center rounded-full border transition-colors">
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </span>
              How the studio works
            </a>
          </motion.div>

          <motion.p
            custom={0.54}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="text-muted-foreground mt-10 font-mono text-xs tracking-wide"
          >
            Confidential · Deadline-guaranteed · Revisions included
          </motion.p>
        </div>

        {/* Right — the order ticket */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.35 }}
          className="relative mx-auto w-full max-w-sm lg:mr-6"
        >
          {/* Paper shadow stack */}
          <div
            aria-hidden
            className="bg-secondary absolute inset-0 -rotate-3 rounded-2xl border"
          />
          <div className="bg-card relative rounded-2xl border shadow-lg">
            {/* Ticket header */}
            <div className="flex items-center justify-between border-b border-dashed px-6 py-4">
              <p className="font-mono text-xs tracking-[0.18em] uppercase">
                Order ticket
              </p>
              <p className="text-muted-foreground font-mono text-xs">Nº 2481</p>
            </div>

            {/* Ticket body */}
            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                  Project
                </p>
                <p className="mt-1 font-serif text-xl">
                  Consumer Behaviour Thesis
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                    Deadline
                  </p>
                  <p className="mt-1 text-sm font-medium">Fri, 14 Nov</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                    Expert
                  </p>
                  <p className="mt-1 text-sm font-medium">Dr. H — Marketing</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                  Status
                </p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: "Brief received", done: true },
                    { label: "Expert matched", done: true },
                    { label: "Draft in progress", done: false },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={
                          step.done
                            ? "bg-primary size-1.5 rounded-full"
                            : "border-muted-foreground/50 size-1.5 rounded-full border"
                        }
                      />
                      <span
                        className={step.done ? "" : "text-muted-foreground"}
                      >
                        {step.label}
                      </span>
                      {!step.done && (
                        <motion.span
                          className="bg-primary/80 ml-1 size-1 rounded-full"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Perforation + stub */}
            <div className="relative border-t border-dashed">
              <span className="bg-background absolute -top-2.5 -left-2.5 size-5 rounded-full border-r" />
              <span className="bg-background absolute -top-2.5 -right-2.5 size-5 rounded-full border-l" />
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
                  <Paperclip className="size-3.5" />
                  brief.pdf attached
                </p>
                {/* Barcode */}
                <div
                  aria-hidden
                  className="flex h-6 items-end gap-[2.5px] opacity-70"
                >
                  {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3].map(
                    (width, index) => (
                      <span
                        key={index}
                        className="bg-foreground inline-block h-full"
                        style={{ width: `${width}px` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
