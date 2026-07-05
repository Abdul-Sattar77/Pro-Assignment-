"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Stat {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  note: string;
}

const STATS: Stat[] = [
  {
    value: 2500,
    suffix: "+",
    label: "Projects delivered",
    note: "across 40+ subjects",
  },
  {
    value: 98,
    suffix: "%",
    label: "On time or early",
    note: "deadline guarantee",
  },
  {
    value: 150,
    suffix: "+",
    label: "Vetted specialists",
    note: "tested before joining",
  },
  {
    value: 4.9,
    suffix: "/5",
    decimals: 1,
    label: "Average rating",
    note: "from real clients",
  },
];

/** Counts up when scrolled into view. */
function Counter({
  value,
  suffix,
  decimals = 0,
}: Omit<Stat, "label" | "note">) {
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
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

/** Editorial numbers wall — oversized serif numerals over hairline grid. */
export function Stats() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: easeOut, delay: index * 0.08 }}
            className="border-b px-8 py-12 sm:border-b-0 sm:not-last:border-r lg:px-10 lg:py-16"
          >
            <p className="font-serif text-5xl font-medium tracking-tight lg:text-6xl">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </p>
            <p className="mt-3 text-sm font-medium">{stat.label}</p>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
              {stat.note}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
