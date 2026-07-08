"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

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
    <section id="services" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="max-w-2xl"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            01 / Services
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Written, typed, or coded —{" "}
            <span className="aurora-text">we handle it all.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-pretty">
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
              className="aurora-border group flex flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-white/25"
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
                  className="absolute inset-0 bg-linear-to-t from-[#0c0c1b] via-[#0c0c1b]/30 to-transparent"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {service.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/3 px-2.5 py-0.5 font-mono text-[10px] tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={href}
                  className="aurora-text mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  Order this
                  <ArrowUpRight className="size-4 text-fuchsia-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
