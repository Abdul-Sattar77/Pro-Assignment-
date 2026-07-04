# Prossignment Portal — Design System

> **Status:** Foundational · **Priority:** HIGHEST (client's #1 requirement) · **Owner:** Design-system lead (Dev A) + all devs
> **Mandate:** Every screen must feel like a premium SaaS product (Linear / Stripe / Vercel / Notion / Raycast / Clerk quality) — **never** a generic admin dashboard.
> **Rule:** These tokens are the law. No raw hex, no magic pixel values, no ad-hoc shadows in feature code. Consume tokens only.

---

## 1. Design Philosophy

**"Calm, precise, and effortless."** The interface should get out of the way. Information is dense but never cluttered; motion is present but never noisy; color is quiet so that content and status carry meaning.

Five principles:

1. **Clarity over decoration** — every element earns its place.
2. **Hierarchy through space & type**, not through borders and color.
3. **Motion communicates**, it never entertains — it explains state changes.
4. **Consistency is a feature** — one button, one card, one table, everywhere.
5. **Accessible by default** — if it isn't usable by everyone, it isn't done.

## 2. Brand Personality

Professional · Trustworthy · Modern · Focused · Quietly confident. Think "financial-grade tool that's a pleasure to use." Navy communicates trust and seriousness; generous whitespace communicates premium.

---

## 3. Design Tokens (the source of truth)

All tokens are defined as CSS variables and mapped into Tailwind's theme. Semantic tokens (not raw colors) are what components consume.

```
RAW SCALE          →  SEMANTIC TOKEN            →  COMPONENT USE
navy-900 #0B1220      --color-bg                    page background (dark)
white    #FFFFFF      --color-surface               card / panel background
blue-600 #2563EB      --color-primary               primary actions
gray-500 #6B7280      --color-text-muted            secondary text
```

Semantic layers: `bg`, `surface`, `surface-elevated`, `border`, `text`, `text-muted`, `primary`, `primary-foreground`, `accent`, `success`, `warning`, `danger`, `info`, `ring`, `overlay`.

---

## 4. Color System

Restrained by design — **navy + white + gray + one accent blue**, with a minimal semantic set for status.

### Brand

| Token                | Light     | Dark      | Use                                       |
| -------------------- | --------- | --------- | ----------------------------------------- |
| `primary`            | `#2563EB` | `#3B82F6` | primary buttons, active nav, links, focus |
| `primary-foreground` | `#FFFFFF` | `#0B1220` | text on primary                           |
| `navy` (brand)       | `#0B1220` | `#0B1220` | logo, deep surfaces, dark bg              |
| `accent`             | `#3B82F6` | `#60A5FA` | subtle highlights, sparklines             |

### Neutrals (gray scale)

`50 #F8FAFC · 100 #F1F5F9 · 200 #E2E8F0 · 300 #CBD5E1 · 400 #94A3B8 · 500 #64748B · 600 #475569 · 700 #334155 · 800 #1E293B · 900 #0F172A · 950 #020617`

### Semantic status (used sparingly, always with icon + text, never color alone)

| Token     | Color     | Meaning                   |
| --------- | --------- | ------------------------- |
| `success` | `#16A34A` | completed, paid, approved |
| `warning` | `#D97706` | pending, due soon         |
| `danger`  | `#DC2626` | overdue, rejected, error  |
| `info`    | `#2563EB` | neutral information       |

**Accessibility rule:** never encode meaning in color alone — pair with icon + label (see §17).

---

## 5. Typography Scale

- **Font:** `Inter` (UI) via `next/font` (self-hosted, no layout shift). Mono: `JetBrains Mono` for IDs/code/numbers in tables.
- **Principle:** tight, consistent, generous line-height for reading; snug for UI.

| Token     | Size / Line | Weight | Use                          |
| --------- | ----------- | ------ | ---------------------------- |
| `display` | 36 / 40     | 700    | marketing / big empty states |
| `h1`      | 30 / 36     | 700    | page titles                  |
| `h2`      | 24 / 32     | 600    | section headers              |
| `h3`      | 20 / 28     | 600    | card titles                  |
| `h4`      | 16 / 24     | 600    | sub-headers                  |
| `body`    | 14 / 22     | 400    | default body                 |
| `body-sm` | 13 / 20     | 400    | secondary text               |
| `caption` | 12 / 16     | 500    | labels, meta                 |
| `mono`    | 13 / 20     | 500    | IDs, amounts                 |

Rules: max ~1 heading weight jump per level; `text-muted` for secondary; numerals `tabular-nums` in tables/finance.

---

## 6. Spacing System (4px base)

Scale (px): `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`. Named: `xs=4 · sm=8 · md=12 · lg=16 · xl=24 · 2xl=32 · 3xl=48`.

- **Density:** comfortable default; a compact mode for data tables.
- **Rhythm:** section padding `24–32`, card padding `16–24`, control gap `8–12`.
- **No magic numbers** — only scale values.

## 7. Border Radius

| Token         | Value  | Use                            |
| ------------- | ------ | ------------------------------ |
| `radius-sm`   | 6px    | inputs, badges, small controls |
| `radius-md`   | 10px   | buttons, cards, dropdowns      |
| `radius-lg`   | 14px   | modals, large cards, panels    |
| `radius-xl`   | 20px   | hero/feature surfaces          |
| `radius-full` | 9999px | avatars, pills, toggles        |

Consistent, soft corners = premium. No sharp 0px corners except full-bleed dividers.

## 8. Elevation & Shadows

Layered, soft, low-opacity. Dark mode uses subtler shadows + border to define edges.

| Token                                                                                                          | Use                     |
| -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `shadow-xs`                                                                                                    | hover on flat elements  |
| `shadow-sm`                                                                                                    | cards at rest           |
| `shadow-md`                                                                                                    | dropdowns, popovers     |
| `shadow-lg`                                                                                                    | modals, command palette |
| `shadow-glass`                                                                                                 | glass surfaces (see §9) |
| Rule: elevation implies interactivity/floating. Don't over-shadow; borders + `surface-elevated` often suffice. |

## 9. Glass Effects (only where appropriate)

Used sparingly: command palette, top nav on scroll, overlays. Recipe: `background: surface @ 70–80% opacity + backdrop-blur(12px) + 1px hairline border`. Never on dense content or tables.

## 10. Iconography

- **Library:** `lucide-react` (consistent, minimal, matches the aesthetic).
- **Sizes:** 16 (inline), 18 (buttons), 20 (nav), 24 (feature).
- **Stroke:** 1.75–2. Icons are decorative reinforcement — always paired with text for meaning.

---

## 11. Motion Guidelines & Animation Principles (Framer Motion)

**Purposeful, fast, subtle.** Motion explains state; it never delays the user.

| Token          | Duration | Easing        | Use                     |
| -------------- | -------- | ------------- | ----------------------- |
| `motion-fast`  | 120ms    | ease-out      | hovers, small toggles   |
| `motion-base`  | 200ms    | ease-out      | dropdowns, tabs, badges |
| `motion-modal` | 240ms    | spring (soft) | modals, drawers         |
| `motion-page`  | 260ms    | ease-in-out   | route transitions       |

Principles:

1. **Enter fast, exit faster.** Never block interaction.
2. **Move a little** — 4–12px translate, subtle scale (0.98→1). No bouncing UI.
3. **Respect `prefers-reduced-motion`** — reduce to opacity fades / disable.
4. **Orchestrate with stagger** for lists (≤40ms) — feels alive, not slow.
5. **One hero motion per screen max** — restraint reads as premium.

Signature motions: page fade-slide, card hover lift, sidebar expand/collapse, modal/drawer spring, skeleton shimmer, animated stat counters, status-badge cross-fade, toast slide-in.

---

## 12. Grid System & Layout

- **App shell:** fixed sidebar (collapsible) + top bar + scrollable content.
- **Content grid:** 12-column, max content width ~1440, gutters from spacing scale.
- **Dashboards:** responsive widget grid (CSS grid, `minmax` auto-fit).
- **Forms:** single-column by default; two-column only on ≥lg for short fields.

## 13. Responsive Breakpoints (desktop-first, degrade gracefully)

| Token                                                                                                                      | Min width | Target        |
| -------------------------------------------------------------------------------------------------------------------------- | --------- | ------------- |
| `sm`                                                                                                                       | 640       | large phone   |
| `md`                                                                                                                       | 768       | tablet        |
| `lg`                                                                                                                       | 1024      | laptop        |
| `xl`                                                                                                                       | 1280      | desktop       |
| `2xl`                                                                                                                      | 1536      | large desktop |
| Sidebar collapses to icon rail < `lg`, to drawer < `md`. Tables become stacked cards / horizontal-scroll on small screens. |

---

## 14. Light & Dark Themes

Both are first-class. Theme via `class` strategy + CSS variables; toggle persisted; respects system preference on first load.

- **Light:** `bg` = gray-50, `surface` = white, text = gray-900.
- **Dark:** `bg` = navy-950, `surface` = navy-900/`#111827`, text = gray-100, borders lighten, shadows soften, glass darkens.
- Every token has a light + dark value. Never hardcode a color that doesn't adapt.

---

## 15. Component Variants (contract for the library — built in Phase 7)

### Buttons

Variants: `primary · secondary · outline · ghost · destructive · link`. Sizes: `sm · md · lg · icon`. States: default/hover/active/focus-visible/disabled/**loading** (spinner + disabled). Micro-interaction: subtle press scale (0.98).

### Inputs / Fields

Text, textarea, select, combobox, date, file, toggle, checkbox, radio, OTP. States: default/focus(ring)/error/disabled/readonly. Every field: label + helper + error slot. Focus ring uses `ring` token, always visible for keyboard users.

### Cards

`base · interactive(hover-lift) · stat/metric · glass`. Padding from scale; `radius-lg`; `shadow-sm` at rest.

### Modals & Drawers

Modal: centered, `radius-lg`, `shadow-lg`, overlay + spring in. Drawer: right/left slide, for detail panels & filters. Both trap focus, close on Esc/overlay, restore focus on close.

### Tables

Interactive data tables: sortable headers, row hover, sticky header, selection, row actions menu, pagination, density toggle, column visibility, inline status badges, empty/loading/error states. Numbers `tabular-nums`.

### Badges & Tags

Badge = status (semantic color + dot/icon). Tag = user labels (neutral, removable). Pill shape (`radius-full`), `caption` type.

### Alerts

Inline info/success/warning/danger with icon, title, description, optional action. Low-saturation background + accent border.

### Toasts

Bottom-right stack, auto-dismiss, slide-in (`motion-base`), variants (success/error/info/loading→resolve), action + close. Max 3 visible.

### Loading States & Skeletons

Skeletons mirror final layout (shimmer). Buttons show inline spinners. Route-level suspense fallbacks are skeletons, never blank/spinner-only.

### Empty / Error / Success States

- **Empty:** friendly illustration/icon + one-line explanation + primary CTA (e.g. "No assignments yet — Create your first").
- **Error:** calm, non-technical message + retry + support hint; never a stack trace.
- **Success:** confirmation with next-step CTA; toast for transient, page state for durable.

### Dashboard Widgets

Metric tile (label + big number + animated counter + trend delta + sparkline), chart card, activity feed, list widget, progress widget. Consistent header (title + period + menu).

### Forms (guidelines)

- Group related fields; section headers; helper text under fields.
- Validate on blur + submit (Zod); show one error per field; summarize on submit failure.
- Primary action right-aligned; destructive actions separated + confirmed.
- Autosave/drafts where sensible; disable submit while pending with loading label.
- Keyboard-first: logical tab order, Enter submits, Esc cancels dialogs.

---

## 16. Charts (data visualization)

Premium, minimal charts. Palette: primary/accent blues + neutral grid; semantic colors only for status series. No 3D, no heavy gridlines, no rainbow. Always: legend, axis labels, tooltip, empty + loading states, animated draw-in (subtle). Numbers formatted (currency/percent) consistently. (Library selection finalized in Phase 6/7; must support theming + accessibility.)

---

## 17. Accessibility Standards (WCAG 2.1 AA — mandatory)

- **Contrast:** text ≥ 4.5:1, large text/icons ≥ 3:1 — verified for light AND dark.
- **Never color-only:** status = color + icon + text.
- **Keyboard:** everything operable; visible focus ring on all interactive elements; logical tab order; skip-to-content.
- **Screen readers:** semantic HTML, ARIA where needed, labeled inputs, `aria-live` for toasts/async.
- **Motion:** honor `prefers-reduced-motion`.
- **Targets:** ≥ 40×40px hit areas on touch.
- **Forms:** programmatic label association, error `aria-describedby`.
  Accessibility is part of Definition of Done — a component isn't done until it passes.

---

## 18. Governance

- Tokens live in one place (`frontend` theme config + CSS variables) and are documented here.
- Changing a token = a reviewed PR (affects everyone) — see `git/git-workflow.md`.
- Component variants are agreed here **before** building them in Phase 7.
- If a feature needs a new pattern, it's proposed here first, then built once in `shared/`, then reused — never duplicated.

---

_This design system is the visual contract for the entire product. It is finalized into tokens & components in Phases 6–7._
