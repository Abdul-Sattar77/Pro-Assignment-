# Feature: Marketing (Landing)

**Owner:** Dev A · **Domain:** Public site · **Status:** ✅ Implemented (v3 — "Aurora" WebGL redesign)

## Design direction: "Aurora"

Research-driven redesign following 2026 award-site patterns (dark cinematic
canvases, Three.js hero scenes, scroll-driven storytelling, glow + glass):

- **Always-dark deep-space palette** with iridescent **violet → fuchsia →
  cyan** accents, scoped via `.theme-aurora` (the app keeps core tokens).
- **Space Grotesk** display type (`font-display`), mono captions, kinetic
  word reveals.
- **Real WebGL hero**: `hero-scene.tsx` renders ~12k GPU particles
  (THREE.Points + custom shader, one draw call) as a flowing aurora field whose
  crests follow the cursor. Dynamic-imported (`ssr: false`) with a nebula
  gradient fallback; Canvas uses high-performance GL flags per Three.js
  best practice.

## The order-gate concept

```
Visitor browses freely → "Start your order"
  → guest:  /login?redirect=…  → lands in the studio
  → authed: straight in ("Enter studio")
```

`orderHref(isAuthenticated)` in `constants/` is the single source; retargets to
the order form when Assignments ships.

## Sections (components/)

| Component             | Content                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `navbar`              | Floating pill, condenses to glass on scroll, gradient CTA, session-aware   |
| `hero` + `hero-scene` | Full-viewport particle field + kinetic type + gradient CTA + cursor hint   |
| `marquee`             | Outlined ghost-type subject ticker (CSS, reduced-motion safe)              |
| `services`            | 3D-tilt glass cards with cursor-tracking glow (springs + motion templates) |
| `how-it-works`        | `#process` — scroll-drawn gradient rail with pulsing nodes                 |
| `stats`               | Glass numbers band, gradient count-up counters                             |
| `features`            | `#why-us` — glass bento grid with drifting glow orbs                       |
| `testimonials`        | `#voices` — rotating spotlight quote with blur transitions                 |
| `cta`                 | Supernova finale: converging glows + gradient headline                     |
| `footer`              | Minimal hairline footer                                                    |

## Performance & a11y notes

- Particles: single draw call; uniforms mutated in `useFrame` (no React state).
- `MotionConfig reducedMotion="user"`; marquee pauses via media query; WebGL
  scene is decorative (`aria-hidden`).
- Copy/stats are launch placeholders for the business to refine.
