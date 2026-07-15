import type { Metadata } from "next";
import { AboutContent, Cta, PageHero, Stats } from "@/features/marketing";

export const metadata: Metadata = {
  title: "About — Prossignment",
  description:
    "Prossignment is an academic writing and assignment-support service that pairs students with subject-matter experts and manages every assignment end to end.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Your partner in"
        highlight="academic success."
        subtitle="We help students produce work they can be proud of — matched to real experts, managed properly, and delivered on time."
      />
      <AboutContent />
      <Stats />
      <Cta />
    </>
  );
}
