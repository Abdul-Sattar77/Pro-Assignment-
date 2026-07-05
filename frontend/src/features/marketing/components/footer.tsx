import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "../constants";

/** Editorial footer: link row, then an oversized clipped wordmark. */
export function Footer() {
  return (
    <footer className="bg-[#131009] text-[#ece7df]">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-[#2f2920] py-12 sm:flex-row sm:items-center">
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {LANDING_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-[#a49d92] transition-colors hover:text-[#ece7df]"
              >
                {section.label}
              </a>
            ))}
            <Link
              href={ROUTES.login}
              className="text-sm text-[#a49d92] transition-colors hover:text-[#ece7df]"
            >
              Sign in
            </Link>
          </nav>
          <p className="font-mono text-xs text-[#7c766d]">
            © {new Date().getFullYear()} Prossignment Portal
          </p>
        </div>

        {/* Oversized wordmark, clipped at the baseline */}
        <div
          aria-hidden
          className="h-[11vw] overflow-hidden select-none sm:h-[9vw]"
        >
          <p className="font-serif text-[13.5vw] leading-none font-semibold tracking-tight text-[#ece7df]/10 sm:text-[11vw]">
            Prossignment
          </p>
        </div>
      </div>
    </footer>
  );
}
