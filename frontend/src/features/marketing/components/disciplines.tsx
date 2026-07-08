"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { easeOut } from "@/animations/variants";

/** Every field — communicates breadth at a glance. */
const FIELDS = [
  "Business & Management",
  "Computer Science",
  "Engineering",
  "Law",
  "Medicine & Nursing",
  "Psychology",
  "Economics",
  "Finance & Accounting",
  "Marketing",
  "Mathematics",
  "Statistics",
  "English & Literature",
  "History",
  "Sociology",
  "Education",
  "Political Science",
  "Chemistry",
  "Physics",
  "Biology",
  "Architecture",
  "Environmental Science",
  "Data Science",
  "Philosophy",
  "Media & Communications",
];

const LEVELS = ["High school", "Undergraduate", "Master's", "PhD"];

export function Disciplines() {
  return (
    <section
      id="fields"
      className="scroll-mt-24 border-t border-white/5 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy + level pills */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
              Every field
            </p>
            <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              From Business to Biomedicine —{" "}
              <span className="aurora-text">every subject.</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-pretty">
              Whatever your course, there&apos;s a vetted expert who has done it
              before. And whatever your level, the work is pitched exactly
              right.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <span
                  key={level}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 px-3 py-1 text-sm font-medium"
                >
                  <GraduationCap className="size-3.5 text-[#c4b5fd]" />
                  {level}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="aurora-border relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=80"
              alt="Students collaborating on coursework"
              fill
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-[#060610] via-transparent to-transparent"
            />
          </motion.div>
        </div>

        {/* Field chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
          className="mt-12 flex flex-wrap gap-2.5"
        >
          {FIELDS.map((field) => (
            <span
              key={field}
              className="hover:border-primary/40 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-sm transition-colors"
            >
              {field}
            </span>
          ))}
          <span className="text-muted-foreground rounded-full border border-dashed border-white/15 px-4 py-1.5 text-sm">
            + many more
          </span>
        </motion.div>
      </div>
    </section>
  );
}
