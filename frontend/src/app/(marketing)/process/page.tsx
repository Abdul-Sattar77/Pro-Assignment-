import type { Metadata } from "next";
import { Cta, HowItWorks, PageHero } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Process — Prossignment",
  description:
    "How Prossignment works: submit your assignment, get matched with a subject expert, track every step, and receive polished, grade-ready work.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title="From brief to"
        highlight="grade-ready work."
        subtitle="A simple, managed workflow — you always know who is on your assignment and exactly where it stands."
      />
      <HowItWorks />
      <Cta />
    </>
  );
}
