import { ROUTES } from "@/constants/routes";

/**
 * Primary navigation for the public website. Each entry is a real page (the
 * public site is deliberately separate from the internal portal), so students
 * can explore before ever touching the studio.
 */
export const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.servicesPage, label: "Services" },
  { href: ROUTES.process, label: "Process" },
  { href: ROUTES.faq, label: "FAQ" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

/**
 * Where "Order Now" sends people. Guests must authenticate first (the
 * concept: browse freely, log in to order), then land straight on the order
 * form.
 */
export function orderHref(isAuthenticated: boolean): string {
  return isAuthenticated
    ? ROUTES.newOrder
    : `${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.newOrder)}`;
}
