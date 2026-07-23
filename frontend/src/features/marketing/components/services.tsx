"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpenCheck,
  Briefcase,
  Calculator,
  ClipboardCheck,
  FileSignature,
  FlaskConical,
  GraduationCap,
  Languages,
  LineChart,
  Microscope,
  NotebookPen,
  Presentation,
  Quote,
  Scale,
  SpellCheck,
  Table2,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

/** Everything else we cover — the "we do it all" grid under the hero cards. */
const MORE_SERVICES: { icon: typeof SpellCheck; label: string }[] = [
  { icon: SpellCheck, label: "Editing & proofreading" },
  { icon: NotebookPen, label: "Coursework & homework" },
  { icon: FlaskConical, label: "Lab reports & experiments" },
  { icon: Microscope, label: "Case studies" },
  { icon: Briefcase, label: "Business plans & reports" },
  { icon: FileSignature, label: "CVs & personal statements" },
  { icon: Quote, label: "Annotated bibliographies" },
  { icon: BookOpenCheck, label: "Reflective & critical writing" },
  { icon: Calculator, label: "Maths, stats & finance" },
  { icon: Table2, label: "Excel, SPSS & R analysis" },
  { icon: Presentation, label: "PowerPoint & posters" },
  { icon: GraduationCap, label: "Exam revision & tutoring" },
  { icon: ClipboardCheck, label: "Assignment reviews & rewrites" },
  { icon: Languages, label: "Translation & summarising" },
  { icon: Scale, label: "Law & policy essays" },
  { icon: LineChart, label: "Data visualisation" },
];

/** Subjects we take on — the breadth strip. */
const SUBJECTS = [
  "Business",
  "Nursing & Healthcare",
  "Law",
  "Engineering",
  "Computer Science",
  "Psychology",
  "Economics",
  "Finance & Accounting",
  "Marketing",
  "Sociology",
  "Education",
  "Medicine",
  "Management",
  "Biology & Chemistry",
  "Mathematics",
  "English & Literature",
  "History",
  "Political Science",
];

interface Service {
  title: string;
  blurb: string;
  tags: string[];
  image: string;
  alt: string;
}

/** Real assignment-work photography (Unsplash CDN — whitelisted in next.config). */
const SERVICES: Service[] = [
  {
    title: "Essays & academic writing",
    blurb:
      "Essays, term papers, reports and literature reviews — argued clearly, sourced properly, referenced to your style.",
    tags: ["Essays", "Reports", "Reviews", "APA · MLA · Harvard"],
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    alt: "Fountain pen writing on paper",
  },
  {
    title: "Programming & development",
    blurb:
      "Coding assignments and projects — Python, Java, C++, web, SQL and machine learning, delivered with clean, commented code.",
    tags: ["Python", "Java · C++", "Web · SQL", "ML / AI"],
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
    alt: "Source code on a screen",
  },
  {
    title: "Typing & transcription",
    blurb:
      "Handwritten notes, audio, or scanned PDFs typed up fast and formatted exactly to your brief — accurate and on time.",
    tags: ["Audio → text", "Handwriting", "PDF → Word", "Formatting"],
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
    alt: "Student typing on a laptop",
  },
  {
    title: "Research & data analysis",
    blurb:
      "Literature reviews, case studies and statistics (SPSS, R, Excel) with a defensible method and clear findings.",
    tags: ["SPSS · R", "Statistics", "Case studies", "Surveys"],
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    alt: "Data charts and analysis on paper",
  },
  {
    title: "Dissertations & theses",
    blurb:
      "Full support from proposal to defense — chapter by chapter, milestone-tracked, with the depth your degree demands.",
    tags: ["Proposal", "Chapters", "Methodology", "Defense"],
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
    alt: "Rows of books in a library",
  },
  {
    title: "Presentations & slides",
    blurb:
      "Decks and posters that read clean and land well — tight narrative, sharp visuals, and speaker notes included.",
    tags: ["Slides", "Posters", "Speaker notes", "Design"],
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    alt: "Team reviewing a presentation",
  },
];

/** Image-forward services grid covering every type of assignment work. */
export function Services() {
  const { data: user } = useCurrentUser();
  const href = orderHref(Boolean(user));

  return (
    <section
      id="services"
      className="scroll-mt-24 bg-white py-20 text-slate-900 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="max-w-2xl"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-sky-600 uppercase">
            01 / Services
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Written, typed, or coded —{" "}
            <span className="bg-linear-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
              we handle it all.
            </span>
          </h2>
          <p className="mt-4 text-pretty text-slate-600">
            Whatever the format and whatever the subject, your work is matched
            to a specialist and delivered to spec.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: easeOut,
                delay: (index % 3) * 0.08,
              }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* Photo */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-white/70 to-transparent"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {service.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={href}
                  className="mt-5 inline-flex items-center gap-1 bg-linear-to-r from-sky-500 to-indigo-600 bg-clip-text text-sm font-semibold text-transparent"
                >
                  Get help with this
                  <ArrowUpRight className="size-4 text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Everything else we cover */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mt-20"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.3em] text-sky-600 uppercase">
              Full coverage
            </p>
            <h3 className="font-display mt-4 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
              Every format.{" "}
              <span className="bg-linear-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Every subject.
              </span>
            </h3>
            <p className="mt-4 text-pretty text-slate-600">
              If it&apos;s academic, we do it. From a one-page summary to a full
              dissertation — any brief, any citation style, any deadline.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MORE_SERVICES.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  ease: easeOut,
                  delay: (index % 4) * 0.05,
                }}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md hover:shadow-blue-500/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sky-500/15 to-indigo-500/15 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="size-4.5" />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Subjects strip */}
          <div className="mt-10">
            <p className="mb-4 text-center text-xs tracking-wide text-slate-500">
              Popular subjects our specialists cover
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUBJECTS.map((subject) => (
                <span
                  key={subject}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
