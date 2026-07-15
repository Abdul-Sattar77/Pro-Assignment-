import {
  Cta,
  Disciplines,
  Features,
  Hero,
  HowItWorks,
  Marquee,
  Services,
  Stats,
  Testimonials,
} from "@/features/marketing";

/**
 * Public landing page — thin composition of marketing sections. Chrome
 * (theme, navbar, footer) is provided by the marketing route-group layout.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <Disciplines />
      <HowItWorks />
      <Stats />
      <Features />
      <Testimonials />
      <Cta />
    </>
  );
}
