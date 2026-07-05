import {
  Cta,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
  Services,
  Stats,
  Testimonials,
} from "@/features/marketing";

/**
 * Public landing page — thin composition of marketing sections
 * (frontend-standards §3: route files compose, they don't implement).
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
