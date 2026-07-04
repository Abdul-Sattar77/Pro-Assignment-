# Frontend Coding Standards — React · Next.js · TypeScript

> Applies to everything in `frontend/`. Enforced by ESLint + Prettier + `tsc --strict`.

---

## 1. TypeScript

- **Strict mode ON** (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitAny`). No `any` — use `unknown` + narrowing, or a proper type.
- **`type` for unions/shapes, `interface` for extendable object contracts.** Be consistent within a file.
- **No `enum`** — use `as const` objects + union types (better tree-shaking, matches API strings):
  ```ts
  export const ASSIGNMENT_STATUS = {
    DRAFT: "draft",
    ASSIGNED: "assigned",
  } as const;
  export type AssignmentStatus =
    (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];
  ```
- **Core API shapes come from generated types** (`types/api.d.ts` via `openapi-typescript`) — never hand-drift them; extend/re-export in feature `types/`.
- Prefer `type`-safe utilities over casting. Casts (`as`) require a comment justifying them.
- Discriminated unions for state (`{ status: 'loading' } | { status: 'error', error } | { status: 'success', data }`).
- No non-null `!` except where provably safe (comment why).

## 2. React

- **Function components + hooks only.** No class components.
- **One component per file**; file name = component name (`AssignmentCard.tsx`). Small components (< ~150 lines) — split when larger.
- **Props:** typed `Props` type; destructure in signature; no `React.FC` (use explicit return). Avoid boolean-prop explosion — prefer a `variant` union.
- **Composition over configuration** — build from small primitives; avoid deeply nested conditional rendering (extract sub-components).
- **Hooks rules:** call unconditionally at top; custom hooks start with `use`; keep hooks pure and focused.
- **Derive, don't duplicate state.** Compute from props/state; `useMemo`/`useCallback` only for measured cost or referential stability.
- **Keys** are stable ids, never array index.
- **Side effects** in `useEffect` with correct deps; prefer event handlers/React Query over effects for data.
- **No business logic in components** — move to hooks (`features/*/hooks`) or services.
- **Accessibility:** semantic elements, labeled controls, keyboard support, visible focus (see design-system §17). No `div` buttons.

## 3. Next.js (App Router)

- **Server Components by default; `'use client'` only when needed** (state, effects, browser APIs, event handlers, Framer Motion).
- **Route files are thin** — compose feature components + providers; no data/business logic inline.
- **Data fetching:** all app data comes from the Laravel API via the typed API client + **React Query hooks** in `features/*/hooks`. Do not fetch business data in Server Components against the DB (there is no FE DB).
- **Route groups** for role/section layouts: `(auth)`, `(dashboard)`; shared shells via `layout.tsx`.
- **Metadata** via the Metadata API. **Images** via `next/image`. **Fonts** via `next/font` (self-hosted Inter).
- **Loading/Error UI:** use `loading.tsx` (skeletons) and `error.tsx` (professional error state) per segment.
- **Env:** only `NEXT_PUBLIC_*` reaches the client; API base URL via env; never embed secrets.

## 4. Styling (Tailwind + ShadCN)

- **Tailwind utilities + design tokens only.** No raw hex, no arbitrary magic values except via tokens. Semantic token classes (e.g. `bg-surface`, `text-muted`) over raw palette.
- **ShadCN components** are the base; customize via tokens/variants, not forks. Shared UI lives in `components/ui`.
- **`cn()` helper** (clsx + tailwind-merge) for conditional classes. No inline `style` except dynamic values impossible in Tailwind.
- **Variants** via `cva` (class-variance-authority) for component variants (button, badge…).
- Responsive: mobile styles then `md:`/`lg:` overrides; test all breakpoints.

## 5. State & Data (see architecture §14)

- **Server state → React Query** (query keys are typed arrays: `['assignments', { filters }]`). Centralize keys per feature.
- **UI/global → Zustand** (small stores; no giant global store).
- **Auth/session → `AuthProvider` context.**
- **Forms → React Hook Form + Zod** (`features/*/validation`). Validate on blur + submit; map API 422 `details` to fields.
- **URL state** (filters/tabs/pagination) via `searchParams`.
- No prop-drilling beyond ~2 levels — use context or composition.

## 6. API communication

- **One Axios instance** (`lib/api-client`) — base URL, `withCredentials`, CSRF, interceptors (401→login, 422→field errors, 5xx→toast). Feature `services/` call it; components/hooks never call Axios directly.
- Services return typed data; errors normalized to a typed shape.

## 7. Animation (Framer Motion)

- Use motion tokens/variants from design system; keep subtle; honor `prefers-reduced-motion`.
- Shared motion primitives (page transition, fade-in, stagger list) live in `animations/` — reuse, don't re-invent per feature.

## 8. File & folder organization (frontend)

- **Feature-based** (`features/<feature>/{components,hooks,services,types,validation,constants,utils}` + README).
- Shared building blocks: `components/ui` (design system), `components/layout`, `components/shared`, `lib/`, `hooks/`, `utils/`, `constants/`, `types/`.
- **Barrel `index.ts`** per feature for its public surface; import features via their public surface only.
- No cross-feature imports of internals. Circular deps are a build error to fix, not ignore.

## 9. Quality gates

- ESLint + Prettier clean; `tsc --noEmit` passes; no `console.log` in committed code (use logger util); no unused exports.
- Every feature folder has a `README.md` (purpose, data flow, endpoints, dependencies).
