"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { easeOut } from "@/animations/variants";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The workspace changed everything for me. I could see exactly where my dissertation stood at every milestone — no chasing, no guessing. Delivered three days early.",
    name: "Sarah M.",
    role: "Postgraduate student",
    initials: "SM",
  },
  {
    quote:
      "I've used other services and it was always chaos over email. Here I chat with my project manager directly and every file lives in one place. Night and day difference.",
    name: "Daniel K.",
    role: "MBA candidate",
    initials: "DK",
  },
  {
    quote:
      "Asked for two revisions on my market research report and both were turned around within a day, free. The quality bar is genuinely high.",
    name: "Amina R.",
    role: "Business consultant",
    initials: "AR",
  },
];

/** Social-proof cards. */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-secondary/40 dark:bg-secondary/20 scroll-mt-20 border-y py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Loved by the people we work with
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: easeOut, delay: index * 0.1 }}
              className="bg-card flex flex-col rounded-xl border p-6"
            >
              <div className="flex gap-0.5" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }, (_, star) => (
                  <Star
                    key={star}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-foreground/90 mt-4 flex-1 text-sm leading-relaxed">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
