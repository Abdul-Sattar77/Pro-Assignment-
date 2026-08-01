import type { Metadata } from "next";
import {
  Cta,
  Disciplines,
  Features,
  Hero,
  HowItWorks,
  Inquiry,
  Marquee,
  Services,
  Stats,
  Testimonials,
} from "@/features/marketing";
import { SITE } from "@/config/seo";

export const metadata: Metadata = {
  title: "Academic Writing & Assignment Help",
  description: SITE.description,
  alternates: { canonical: "/" },
};

/** Organization + website + service structured data for rich search results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      slogan: SITE.tagline,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "ProfessionalService",
      name: SITE.name,
      description: SITE.description,
      url: SITE.url,
      areaServed: "Worldwide",
      serviceType: [
        "Academic writing",
        "Dissertation & thesis help",
        "Research & data analysis",
        "Programming assignments",
        "Editing & proofreading",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "25000",
        bestRating: "5",
      },
    },
  ],
};

/**
 * Public landing page — thin composition of marketing sections. Chrome
 * (theme, navbar, footer) is provided by the marketing route-group layout.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Marquee />
      <Services />
      <Disciplines />
      <HowItWorks />
      <Stats />
      <Features />
      <Testimonials />
      <Inquiry />
      <Cta />
    </>
  );
}
