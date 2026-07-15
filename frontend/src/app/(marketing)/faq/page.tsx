import type { Metadata } from "next";
import { Cta, FaqContent, PageHero } from "@/features/marketing";

export const metadata: Metadata = {
  title: "FAQ — Prossignment",
  description:
    "Answers to common questions about Prossignment — services, originality, confidentiality, referencing styles, deadlines, revisions, and pricing.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions,"
        highlight="answered."
        subtitle="Everything students usually ask before submitting their first assignment. Still unsure? Get in touch."
      />
      <FaqContent />
      <Cta />
    </>
  );
}
