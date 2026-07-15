import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { NAV_LINKS } from "../constants";

/** Aurora footer: hairline top rule, minimal links, gradient star sign-off. */
export function Footer() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <Link
          href={ROUTES.home}
          className="font-display text-lg font-bold tracking-tight"
        >
          prossignment
          <span className="aurora-text">*</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ROUTES.login}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Sign in
          </Link>
        </nav>

        <p className="text-muted-foreground font-mono text-xs">
          © {new Date().getFullYear()} Prossignment
        </p>
      </div>
    </footer>
  );
}
