"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/animations/variants";
import { FAQS, type Faq } from "../data/faq";

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
