# Engineering Standards — Testing · Security · Performance · Documentation · Git

> Cross-cutting standards that apply to both `frontend/` and `backend/`.

---

## 1. Testing

**Philosophy:** test behavior and contracts, not implementation details. Critical business flows must be covered.

**Backend (Laravel)**

- **Unit tests** — Services and Repositories (business rules, state machine transitions, edge cases). Repositories tested against a test DB.
- **Feature/API tests** — each endpoint: auth required, authz enforced, validation (422), success envelope, error envelope, pagination/filter/sort. Use factories + database transactions/refresh.
- **Coverage focus:** assignment workflow, finance calculations, RBAC, file access — these must be thoroughly tested.

**Frontend (Next.js)**

- **Unit** — pure utils, hooks (with mocked services), validation schemas.
- **Component** — key reusable components (states: loading/empty/error/success), a11y checks.
- **E2E (Playwright)** — critical user journeys: login, create assignment → assign → submit → review → revise → complete, payment flow, messaging.

**Rules**

- New feature ⇒ tests in the same PR (Definition of Done).
- Deterministic tests (no real network/time/random — mock them).
- Name tests by behavior: `it('rejects assignment when not in PENDING_ASSIGNMENT')`.

## 2. Security (see also `api/api-standards.md`, `02-system-architecture.md §17`)

- **AuthN:** Sanctum httpOnly cookies, CSRF, `Secure`+`SameSite`; sessions expire; rate-limited login.
- **AuthZ:** DB-driven RBAC + Policies + service invariants (defense in depth). Never trust the client; FE gates are UX only.
- **Input:** validate every write (FormRequest + Zod). Whitelist filters/sorts/includes.
- **Injection:** Eloquent/bindings only; React escaping; sanitize rich text; no `dangerouslySetInnerHTML` without a sanitizer.
- **Files:** type/size allowlist, signed expiring URLs, no public buckets, scan hook.
- **Secrets:** `.env` only, never committed; `.env.example` documents keys; rotate on leak.
- **Transport:** HTTPS/HSTS; strict CORS allowlist with credentials; security headers.
- **Data exposure:** UUID public ids; no sensitive data in URLs/logs; least-privilege API responses (Resources).
- **Audit:** sensitive actions logged + persisted (Activity Timeline).
- **Dependencies:** keep updated; CI dependency audit; pin lockfiles.

## 3. Performance

**Backend**

- Prevent N+1 (eager load in repositories); index frequent filters/sorts; paginate all lists (cap `per_page`).
- Cache expensive reads (config-driven TTL) via cache abstraction; invalidate on writes.
- Offload slow work to **queued Jobs** (email, PDF, file processing) — keep requests fast.
- Select only needed columns for heavy queries; avoid loading full relations when a count suffices.

**Frontend**

- Server Components by default; ship minimal client JS; code-split by route/feature; lazy-load heavy widgets (charts, editors).
- React Query caching + sensible `staleTime`; avoid redundant fetches; optimistic updates where safe.
- `next/image`, `next/font`; memoize only measured hot paths; virtualize very large tables/lists.
- Budget: keep route bundles lean; watch for accidental client-boundary bloat.

**Both**

- Measure before optimizing. Add an index/cache because data shows a need, not by guessing.

## 4. Documentation

**Documentation-First is a project law.** No implementation before the phase's docs are approved.

- **Every folder** (frontend feature, backend module, top-level dir) has a `README.md`: **Purpose · Folder responsibility · Data flow · API flow · Dependencies · Future extension notes.**
- **Every endpoint** documented in OpenAPI + Postman; human guides in `docs/api`.
- **Every DB table** in the data dictionary (`database-design/`).
- **Code comments** explain _why_, not _what_; keep them current or delete them.
- **Keep docs in sync** — a PR that changes behavior updates the relevant docs (checklist item). Stale docs are treated as bugs.
- New developer should understand any module within minutes by reading its README.

## 5. Git (summary — full in `git/git-workflow.md`)

- Trunk-based, short-lived `feat/<scope>/<slug>` branches; protected `main`.
- **Conventional Commits**; small PRs (one concern); ≥1 review; CI green; squash-merge.
- Rebase on `main` before merge; additive migrations; feature-folder ownership; shared surfaces are change-controlled.

## 6. Definition of Done (every feature/PR)

- [ ] Meets requirements; edge cases handled.
- [ ] Follows architecture, conventions, naming; no duplication; no magic values.
- [ ] Tests added and passing; CI green (lint, typecheck, static analysis, build).
- [ ] API: envelope/error standards; OpenAPI + Postman updated; TS types regenerated.
- [ ] UI: tokens/components; light+dark; responsive; a11y; loading/empty/error states.
- [ ] Security: input validated, authz enforced, no secrets, signed file URLs.
- [ ] Docs updated: feature/module README + any affected canonical doc.
- [ ] Reviewed and approved.
