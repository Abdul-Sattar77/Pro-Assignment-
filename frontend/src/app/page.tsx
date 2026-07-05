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
 * `theme-editorial` wrapper scopes the landing's warm paper/ink/orange
 * palette; the application keeps the core design tokens.
 */
export default function HomePage() {
  return (
    <div className="theme-editorial bg-background text-foreground">
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
