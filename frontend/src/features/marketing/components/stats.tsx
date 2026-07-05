"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Stat {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { value: 2500, suffix: "+", label: "Assignments delivered" },
  { value: 150, suffix: "+", label: "Vetted experts" },
  { value: 98, suffix: "%", label: "On-time delivery" },
  { value: 4.9, suffix: "/5", decimals: 1, label: "Client satisfaction" },
];

/** Counts from 0 to `target` when scrolled into view. */
function Counter({ value, suffix, decimals = 0 }: Omit<Stat, "label">) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

/** Trust metrics band with scroll-triggered animated counters. */
export function Stats() {
  return (
    <section className="border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: easeOut, delay: index * 0.07 }}
            className="px-6 py-10 text-center"
          >
            <p className="text-primary text-3xl font-bold sm:text-4xl">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
