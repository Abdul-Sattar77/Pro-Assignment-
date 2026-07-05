import { ROUTES } from "@/constants/routes";

/** Anchor sections on the landing page. */
export const LANDING_SECTIONS = [
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "why-us", label: "Why us" },
  { id: "voices", label: "Voices" },
] as const;

/**
 * Where "Order Now" sends people. Guests must authenticate first (the concept:
 * browse freely, log in to order). Once the Assignments module ships, the
 * redirect target becomes the order form (/assignments/new).
 */
export function orderHref(isAuthenticated: boolean): string {
  return isAuthenticated
    ? ROUTES.dashboard
    : `${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.dashboard)}`;
}
