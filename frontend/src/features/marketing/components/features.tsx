"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Principle {
  title: string;
  description: string;
}

const PRINCIPLES: Principle[] = [
  {
    title: "Specialists, not generalists",
    description:
      "Writers pass subject exams and trial projects before they see a single brief — and carry a public rating on every job since.",
  },
  {
    title: "A manager on every order",
    description:
      "You never chase anyone. A dedicated project manager owns your deadline, your updates, and your peace of mind.",
  },
  {
    title: "One thread, zero chaos",
    description:
      "Briefs, drafts, files, and messages live in one private studio — not scattered across chats, emails, and spreadsheets.",
  },
  {
    title: "Discretion by default",
    description:
      "Encrypted sessions, access-controlled files, and strict confidentiality. Your name stays out of it.",
  },
  {
    title: "Revisions until it's right",
    description:
      "Feedback is part of the craft. Request changes and your expert refines the work — included, not extra.",
  },
];

/** Manifesto: sticky serif heading beside numbered principle rows. */
export function Features() {
  return (
    <section id="why-us" className="scroll-mt-24 border-b py-20 lg:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              03 — Why us
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              Craft has
              <br />
              <span className="text-primary italic">principles.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-sm leading-relaxed">
              Five commitments we make on every single order — the reason
              clients place their second one.
            </p>
          </div>

          <div>
            {PRINCIPLES.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  ease: easeOut,
                  delay: index * 0.05,
                }}
                className="grid gap-3 border-t py-8 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="text-muted-foreground font-mono text-sm">
                  ({index + 1})
                </span>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
