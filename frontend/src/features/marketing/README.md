# Feature: Marketing (Landing)

**Owner:** Dev A · **Domain:** Public site · **Status:** ✅ Implemented (v1)

## Purpose

The public landing experience — the first impression for prospective clients.
Premium design + motion (Linear/Stripe-inspired) with one conversion goal:
**Order Now**. Guests are funneled through auth before ordering.

## The order-gate concept

```
Visitor browses freely → clicks "Order Now"
  → guest:  /login?redirect=…  (register/login)  → lands in the app
  → authed: straight to the app
```

`orderHref(isAuthenticated)` in `constants/` is the single source of that rule.
When the Assignments module ships, its redirect target becomes the order form
(`/assignments/new`) — one-line change.

## Sections (components/)

| Component      | Content                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `navbar`       | Fixed, transparent→glass on scroll, session-aware CTAs, mobile menu                                                          |
| `hero`         | Staggered headline, gradient text, grid+glow background, floating product preview built from real UI primitives, trust chips |
| `stats`        | Animated in-view counters (delivered, experts, on-time %, rating)                                                            |
| `services`     | 6 service cards with hover lift                                                                                              |
| `how-it-works` | 4 steps with animated connector line                                                                                         |
| `features`     | "Why us" grid (6 differentiators)                                                                                            |
| `testimonials` | Social-proof cards (5-star, avatars)                                                                                         |
| `cta`          | Navy gradient conversion panel                                                                                               |
| `footer`       | Brand, section links, legal                                                                                                  |

## Notes

- All scroll animations use `whileInView` + `once: true`; `MotionConfig
reducedMotion="user"` (in Providers) disables them for reduced-motion users.
- Session awareness via `useCurrentUser()` from the auth feature's **public
  surface** (401 → null for guests — no error states on the landing).
- Copy/stats are launch placeholders for the business to refine — structure and
  design are final.
