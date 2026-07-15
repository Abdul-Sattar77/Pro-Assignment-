"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/animations/variants";

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "What kinds of assignments can you help with?",
    a: "Essays, reports, dissertations and theses, research and data analysis, programming and coding, presentations, typing and transcription, and editing or proofreading — across business, law, nursing, engineering, computer science, the sciences, humanities, and more.",
  },
  {
    q: "Is the work original and confidential?",
    a: "Yes. Every assignment is written from scratch to your brief and checked for originality. Your identity and details are never shared, and your work is never resold or reused.",
  },
  {
    q: "How do you match my assignment to a writer?",
    a: "When you submit, we capture the subject, academic level, type, and requirements. A project manager reviews the brief and assigns a specialist who actually works in that field — not a generalist.",
  },
  {
    q: "Can you follow a specific referencing style?",
    a: "Absolutely. Tell us your style — APA, MLA, Harvard, Chicago, IEEE, Vancouver, OSCOLA, or another — and your expert formats every citation and the reference list to match.",
  },
  {
    q: "How do deadlines work?",
    a: "You set the deadline date and time when you submit, and can mark the priority. We schedule the work to deliver with time to spare so you can review before your own submission.",
  },
  {
    q: "Can I talk to my writer and share files?",
    a: "Yes. Once your assignment is submitted you get a private page where you can message the team, upload briefs, reference files, images, and notes, and track every step of the workflow.",
  },
  {
    q: "What if I need changes after delivery?",
    a: "You can request a revision from your assignment page. Your expert reworks the draft against your feedback and the marking criteria until it meets the brief.",
  },
  {
    q: "How much does it cost?",
    a: "Price depends on the type, length, level, and deadline. Submit your assignment for a no-obligation quote — your project manager confirms scope and price with you before any work or payment.",
  },
];

function FaqItem({ faq, index }: { faq: Faq; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="overflow-hidden rounded-2xl border border-white/8 bg-white/3"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-base font-semibold sm:text-lg">
          {faq.q}
        </span>
        <span className="text-primary shrink-0">
          {open ? <Minus className="size-5" /> : <Plus className="size-5" />}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground px-6 pb-5 text-sm leading-relaxed">
            {faq.a}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Accordion FAQ for the public FAQ page. */
export function FaqContent() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <div className="space-y-3">
        {FAQS.map((faq, index) => (
          <FaqItem key={faq.q} faq={faq} index={index} />
        ))}
      </div>
    </div>
  );
}
