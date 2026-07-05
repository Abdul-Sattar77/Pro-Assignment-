# Feature: Marketing (Landing)

**Owner:** Dev A · **Domain:** Public site · **Status:** ✅ Implemented (v2 — Editorial redesign)

## Design direction: "Editorial Studio"

Deliberately **not** the generic SaaS template. Warm **paper & ink** palette
with a **burnt-orange** accent (no blue), oversized **Fraunces serif**
typography, asymmetric magazine layouts, numbered sections (01–05), hairline
rules, mono-font captions, and an order-ticket motif instead of dashboard
mockups.

Palette is scoped via the `.theme-editorial` class (globals.css) — the
application keeps its own core token set. Light + dark both supported.

## The order-gate concept

```
Visitor browses freely → clicks "Place an order"
  → guest:  /login?redirect=…  (register/login)  → lands in the studio
  → authed: straight in
```

`orderHref(isAuthenticated)` in `constants/` is the single source of that rule.
When the Assignments module ships, the target becomes the order form.

## Sections (components/)

| Component      | Content                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `navbar`       | Hairline rule, serif wordmark, numbered links, pill CTA, session-aware                                                                   |
| `hero`         | Asymmetric split: giant serif statement (italic accent) + perforated **order ticket** artifact with live status dots, ghost "A+" numeral |
| `marquee`      | Infinite serif-italic subject ticker (CSS animation, reduced-motion safe)                                                                |
| `services`     | **Numbered expanding index rows** (accordion), sticky serif heading, tag chips, per-service order link                                   |
| `how-it-works` | `#process` — editorial timeline: oversized italic numerals, three-column rhythm                                                          |
| `stats`        | Numbers wall: huge serif counters over hairline grid with mono notes                                                                     |
| `features`     | `#why-us` — manifesto: sticky heading + five numbered principles                                                                         |
| `testimonials` | `#voices` — one oversized rotating pull-quote (6s) with progress dots                                                                    |
| `cta`          | Full-bleed warm-ink finale, enormous serif "Hand it off today."                                                                          |
| `footer`       | Ink footer with oversized clipped wordmark                                                                                               |

## Notes

- Scroll animations: `whileInView` + `once`; `MotionConfig reducedMotion="user"`
  covers motion; the marquee pauses via CSS media query.
- Session awareness via `useCurrentUser()` from auth's public surface.
- Copy/stats are launch placeholders for the business to refine.
