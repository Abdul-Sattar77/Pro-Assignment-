import type { ReactNode } from "react";
import { Footer, Navbar } from "@/features/marketing";

/**
 * Public website shell — deliberately separate from the internal portal. Every
 * marketing page (home + About/Services/Process/FAQ/Contact) renders inside the
 * always-dark `theme-aurora` palette with the floating navbar and footer, so
 * visitors browse a real website before they ever reach the studio.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-aurora bg-background text-foreground dark">
      {/* Finishing textures */}
      <div aria-hidden className="aurora-vignette" />
      <div aria-hidden className="aurora-grain" />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
