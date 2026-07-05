"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

/**
 * Finale: full-bleed ink section with an enormous serif invitation.
 * Fixed warm-black palette in both themes — the landing's one deliberate
 * high-contrast moment.
 */
export function Cta() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="bg-[#131009] py-24 text-[#ece7df] lg:py-36">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="font-mono text-xs tracking-[0.2em] text-[#a49d92] uppercase"
        >
          05 — Begin
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: easeOut, delay: 0.1 }}
          className="mt-6 font-serif text-6xl leading-[1.02] font-medium tracking-tight text-balance sm:text-8xl"
        >
          Hand it off
          <span className="text-[#fb923c] italic"> today.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center gap-6"
        >
          <Button
            asChild
            size="lg"
            className="h-14 rounded-full bg-[#fb923c] px-8 text-base font-medium text-[#1c1006] hover:bg-[#fdac63]"
          >
            <Link href={orderHref(isAuthed)}>
              Place your order
              <ArrowUpRight className="size-5" />
            </Link>
          </Button>
          <p className="max-w-xs text-sm text-[#a49d92]">
            Browse freely — you&apos;ll create your private studio account when
            you order.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
