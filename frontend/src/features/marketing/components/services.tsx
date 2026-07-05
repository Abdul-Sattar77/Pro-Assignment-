"use client";

import { useRef, type PointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

interface Service {
  title: string;
  blurb: string;
  meta: string;
}

const SERVICES: Service[] = [
  {
    title: "Essays & papers",
    blurb: "Structured, sourced, written to your exact brief.",
    meta: "Any subject · any format",
  },
  {
    title: "Research & analysis",
    blurb: "Literature reviews, case studies, defensible method.",
    meta: "Qual · Quant · Citations",
  },
  {
    title: "Dissertations",
    blurb: "Proposal to defense, chapter by approved chapter.",
    meta: "Milestone-tracked",
  },
  {
    title: "Presentations",
    blurb: "Decks that land — narrative, visuals, speaker notes.",
    meta: "Slides · Reports",
  },
  {
    title: "Editing & proofing",
    blurb: "Your draft, elevated to any academic standard.",
    meta: "APA · MLA · Harvard",
  },
  {
    title: "Technical & business",
    blurb: "Statistics, models, code, and business plans.",
    meta: "SPSS · R · Excel · Code",
  },
];

/** Glass card that tilts in 3D toward the cursor with a tracking glow. */
function TiltCard({ service, href }: { service: Service; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, rgba(167,139,250,0.18), transparent 70%)`;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="aurora-border group relative rounded-2xl p-6 transition-colors duration-300 hover:border-white/25"
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div style={{ transform: "translateZ(28px)" }}>
        <p className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
          {service.meta}
        </p>
        <h3 className="font-display mt-3 text-2xl font-bold tracking-tight">
          {service.title}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {service.blurb}
        </p>
        <Link
          href={href}
          className="aurora-text mt-5 inline-flex items-center gap-1 text-sm font-semibold"
        >
          Order this
          <ArrowUpRight className="size-4 text-fuchsia-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/** Services as a 3D-tilt glass grid. */
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
            Every kind of work. <span className="aurora-text">One studio.</span>
          </h2>
        </motion.div>

        <div
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: 1200 }}
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: easeOut,
                delay: (index % 3) * 0.08,
              }}
            >
              <TiltCard service={service} href={href} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
