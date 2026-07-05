"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

interface Service {
  title: string;
  blurb: string;
  tags: string[];
}

const SERVICES: Service[] = [
  {
    title: "Essays & papers",
    blurb:
      "Structured, sourced, and written to your exact brief — from short-form essays to full term papers.",
    tags: ["Any subject", "APA / MLA / Harvard", "Plagiarism-checked"],
  },
  {
    title: "Research & analysis",
    blurb:
      "Literature reviews, case studies, and data work with credible sources and defensible method.",
    tags: ["Qualitative", "Quantitative", "Citations included"],
  },
  {
    title: "Dissertations & theses",
    blurb:
      "Chapter-by-chapter partnership from proposal to defense, with milestones you approve along the way.",
    tags: ["Proposal", "Chapters", "Defense prep"],
  },
  {
    title: "Presentations & reports",
    blurb:
      "Decks and reports that read clean and land well — tight narrative, clear visuals, speaker notes.",
    tags: ["Slides", "Speaker notes", "Exec summaries"],
  },
  {
    title: "Editing & proofreading",
    blurb:
      "Your draft, elevated: grammar, clarity, structure, and formatting to any academic standard.",
    tags: ["Line editing", "Formatting", "Fast turnaround"],
  },
  {
    title: "Technical & business",
    blurb:
      "Statistics, financial models, code, and business plans handled by domain specialists.",
    tags: ["SPSS / R / Excel", "Programming", "Business plans"],
  },
];

/**
 * Services as an editorial index — numbered rows that expand in place.
 * Deliberately not a card grid.
 */
export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section id="services" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          {/* Sticky heading */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              01 — Services
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              What we take
              <br />
              off your plate<span className="text-primary">.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-sm leading-relaxed">
              Every order is matched to a specialist in your field and run by a
              dedicated manager, start to finish.
            </p>
          </div>

          {/* Index rows */}
          <div>
            {SERVICES.map((service, index) => {
              const isOpen = open === index;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.45,
                    ease: easeOut,
                    delay: index * 0.05,
                  }}
                  className="border-b first:border-t"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center gap-5 py-6 text-left"
                  >
                    <span className="text-muted-foreground w-10 shrink-0 font-mono text-sm">
                      0{index + 1}
                    </span>
                    <span
                      className={cn(
                        "flex-1 font-serif text-2xl transition-colors sm:text-3xl",
                        isOpen
                          ? "text-primary italic"
                          : "group-hover:text-primary",
                      )}
                    >
                      {service.title}
                    </span>
                    <Plus
                      className={cn(
                        "text-muted-foreground size-5 shrink-0 transition-transform duration-300",
                        isOpen && "text-primary rotate-45",
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: easeOut }}
                        className="overflow-hidden"
                      >
                        <div className="pb-7 pl-15">
                          <p className="text-muted-foreground max-w-lg leading-relaxed">
                            {service.blurb}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {service.tags.map((tag) => (
                              <span
                                key={tag}
                                className="border-border rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={orderHref(isAuthed)}
                            className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                          >
                            Order this
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
