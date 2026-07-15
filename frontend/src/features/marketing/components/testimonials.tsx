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
    text: "I watched my dissertation move milestone by milestone — no chasing, no guessing. It arrived three days early.",
    name: "Sarah M.",
    role: "Postgraduate student",
  },
  {
    text: "Other services were chaos over email. Here everything lives in one glowing thread. Night and day.",
    name: "Daniel K.",
    role: "MBA candidate",
  },
  {
    text: "Two revisions on my market report, both back within a day, both free. The bar is genuinely high.",
    name: "Amina R.",
    role: "Business consultant",
  },
];

const ROTATE_MS = 6000;

/** One rotating spotlight quote inside a glow frame. */
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
    <section id="voices" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="relative"
        >
          {/* Glow frame */}
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.09),transparent_70%)] blur-xl"
          />

          <div className="aurora-border relative rounded-3xl px-8 py-12 text-center sm:px-14">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
              04 / Voices
            </p>

            <div className="relative mt-8 min-h-44 sm:min-h-36">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={quote.name}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <blockquote className="font-display text-2xl leading-snug font-bold text-balance sm:text-3xl">
                    “{quote.text}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <span className="aurora-text text-sm font-semibold">
                      {quote.name}
                    </span>
                    <span className="text-muted-foreground ml-2 font-mono text-xs">
                      {quote.role}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {QUOTES.map((q, dotIndex) => (
                <button
                  key={q.name}
                  type="button"
                  aria-label={`Show quote ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={
                    dotIndex === index
                      ? "h-1.5 w-8 rounded-full bg-[#3b82f6] transition-all"
                      : "h-1.5 w-4 rounded-full bg-white/15 transition-all hover:bg-white/30"
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
