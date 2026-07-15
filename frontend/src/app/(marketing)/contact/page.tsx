import type { Metadata } from "next";
import { ContactContent, PageHero } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Contact — Prossignment",
  description:
    "Get in touch with Prossignment by email or WhatsApp, or send us a message. Support available 24/7 while you study.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about"
        highlight="your assignment."
        subtitle="Reach us any time — ask a question, request a quote, or just say hello. We usually reply the same day."
      />
      <ContactContent />
    </>
  );
}
