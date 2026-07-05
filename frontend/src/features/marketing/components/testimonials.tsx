"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Quote {
  text: string;
  name: string;
  role: string;
}

const QUOTES: Quote[] = [
  {
    text: "I could see exactly where my dissertation stood at every milestone — no chasing, no guessing. It arrived three days early.",
    name: "Sarah M.",
    role: "Postgraduate student",
  },
  {
    text: "Other services were chaos over email. Here I message my manager directly and every file lives in one place. Night and day.",
    name: "Daniel K.",
    role: "MBA candidate",
  },
  {
    text: "Two revisions on my market report, both back within a day, both free. The quality bar is genuinely high.",
    name: "Amina R.",
    role: "Business consultant",
  },
];

const ROTATE_MS = 6000;

/** One oversized rotating pull-quote — editorial, not a card wall. */
export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % QUOTES.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index]!;

  return (
    <section
      id="voices"
      className="bg-secondary/50 scroll-mt-24 border-b py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
          04 — Client voices
        </p>

        <div className="relative mt-10 min-h-64 sm:min-h-56">
          <span
            aria-hidden
            className="text-primary/15 absolute -top-10 -left-2 font-serif text-[10rem] leading-none italic select-none"
          >
            “
          </span>
          <AnimatePresence mode="wait">
            <motion.figure
              key={quote.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="relative"
            >
              <blockquote className="max-w-4xl font-serif text-3xl leading-snug font-medium text-balance sm:text-4xl lg:text-5xl">
                {quote.text}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="bg-primary inline-block h-px w-10" />
                <span className="text-sm font-medium">{quote.name}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {quote.role}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="mt-10 flex gap-2">
          {QUOTES.map((q, dotIndex) => (
            <button
              key={q.name}
              type="button"
              aria-label={`Show quote ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={
                dotIndex === index
                  ? "bg-primary h-1.5 w-8 rounded-full transition-all"
                  : "bg-border hover:bg-muted-foreground/40 h-1.5 w-4 rounded-full transition-all"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
