"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

/**
 * Final conversion section. The gradient panel is the one deliberate
 * "hero moment" outside the hero itself.
 */
export function Cta() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="relative overflow-hidden rounded-3xl bg-[#0B1220] px-8 py-16 text-center sm:px-16 sm:py-20"
        >
          {/* Glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),transparent)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.25),transparent)] blur-2xl"
          />

          <h2 className="relative text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Ready to hand off your next assignment?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-slate-300">
            Create your free account, post your requirements, and get matched
            with an expert today. It takes less than two minutes.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="h-12 bg-white px-7 text-base text-slate-900 hover:bg-slate-100"
            >
              <Link href={orderHref(isAuthed)}>
                Order Now
                <ArrowRight className="size-4.5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400">
              No commitment — browse first, order when ready.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
