import { ROUTES } from "@/constants/routes";

/** Anchor sections on the landing page. */
export const LANDING_SECTIONS = [
  { id: "services", label: "Services" },
  { id: "fields", label: "Fields" },
  { id: "process", label: "Process" },
  { id: "why-us", label: "Why us" },
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
