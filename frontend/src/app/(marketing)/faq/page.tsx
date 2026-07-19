import type { Metadata } from "next";
import { Cta, FaqContent, FAQS, PageHero } from "@/features/marketing";

/** FAQPage structured data → eligible for FAQ rich results in search. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export const metadata: Metadata = {
  title: "FAQ",
  alternates: { canonical: "/faq" },
  description:
    "Answers to common questions about Prossignment — services, originality, confidentiality, referencing styles, deadlines, revisions, and pricing.",
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
