import {
  Cta,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Marquee,
  Navbar,
  Services,
  Stats,
  Testimonials,
} from "@/features/marketing";

/**
 * Public landing page — thin composition of marketing sections. The
 * `theme-aurora` wrapper scopes the landing's cosmic dark palette
 * (deliberately always-dark); the application keeps the core tokens.
 */
export default function HomePage() {
  return (
    <div className="theme-aurora bg-background text-foreground dark">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <HowItWorks />
        <Stats />
        <Features />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
