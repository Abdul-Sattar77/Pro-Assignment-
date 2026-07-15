import type { Metadata } from "next";
import { Cta, Disciplines, PageHero, Services } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Services — Prossignment",
  description:
    "Essays, dissertations, programming, research and data analysis, presentations, typing and editing — academic support across every discipline.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Every kind of"
        highlight="academic work."
        subtitle="Whatever the format and whatever the subject, your work is matched to a specialist and delivered to your exact brief."
      />
      <Services />
      <Disciplines />
      <Cta />
    </>
  );
}
