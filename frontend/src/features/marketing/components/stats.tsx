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
  { value: 2500, suffix: "+", label: "Projects delivered" },
  { value: 98, suffix: "%", label: "On time or early" },
  { value: 150, suffix: "+", label: "Vetted specialists" },
  { value: 4.9, suffix: "/5", decimals: 1, label: "Average rating" },
];

/** Counts up when scrolled into view. */
function Counter({ value, suffix, decimals = 0 }: Omit<Stat, "label">) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
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

/** Numbers band: gradient counters inside a glass strip. */
export function Stats() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="aurora-border grid grid-cols-2 divide-white/8 rounded-3xl sm:grid-cols-4 sm:divide-x"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <p className="aurora-text font-display text-4xl font-bold sm:text-5xl">
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-muted-foreground mt-2 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
