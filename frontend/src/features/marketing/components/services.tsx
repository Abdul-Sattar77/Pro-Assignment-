"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpenText,
  FileEdit,
  FileText,
  GraduationCap,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { easeOut } from "@/animations/variants";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICES: Service[] = [
  {
    icon: FileText,
    title: "Essays & Papers",
    description:
      "Well-structured, thoroughly researched essays and term papers on any subject, tailored to your guidelines.",
  },
  {
    icon: BookOpenText,
    title: "Research & Analysis",
    description:
      "Literature reviews, case studies, and data-driven analysis with credible sources and clear citations.",
  },
  {
    icon: GraduationCap,
    title: "Dissertations & Theses",
    description:
      "Chapter-by-chapter support from proposal to defense — with milestones you can track along the way.",
  },
  {
    icon: Presentation,
    title: "Presentations & Reports",
    description:
      "Persuasive decks and professional reports with clean design, tight narrative, and speaker notes.",
  },
  {
    icon: FileEdit,
    title: "Editing & Proofreading",
    description:
      "Polish for grammar, clarity, structure, and style — plus formatting to APA, MLA, Harvard, or your spec.",
  },
  {
    icon: BarChart3,
    title: "Technical & Business Work",
    description:
      "Statistics, finance models, programming tasks, and business plans handled by domain specialists.",
  },
];

/** Services grid with hover-lift cards. */
export function Services() {
  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Whatever you&apos;re working on, we&apos;ve got an expert for it
          </h2>
          <p className="text-muted-foreground mt-4 text-pretty">
            Every project is matched to a specialist in your field and managed
            by a dedicated project manager from start to finish.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: (index % 3) * 0.08,
              }}
              className="group bg-card hover:border-primary/40 relative rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110">
                <service.icon className="size-5.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{service.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
