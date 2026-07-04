# Prossignment Portal — System Architecture (Phase 2)

> **Status:** Draft for approval · **Owner:** Lead Architect · **Audience:** All 3 developers
> **Rule:** This document is the single source of architectural truth. If code disagrees with this document, the code is wrong until this document is updated by consensus.

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Module Dependency Diagram](#2-module-dependency-diagram)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Request Lifecycle](#5-request-lifecycle)
6. [Authentication Flow](#6-authentication-flow)
7. [Authorization Flow (RBAC)](#7-authorization-flow-rbac)
8. [Database Layer Strategy](#8-database-layer-strategy)
9. [File Management Strategy](#9-file-management-strategy)
10. [API Structure](#10-api-structure)
11. [Folder Structure (High Level)](#11-folder-structure-high-level)
12. [Naming Conventions](#12-naming-conventions)
13. [Shared Types Strategy](#13-shared-types-strategy)
14. [State Management Strategy](#14-state-management-strategy)
15. [Error Handling Strategy](#15-error-handling-strategy)
16. [Logging Strategy](#16-logging-strategy)
17. [Security Strategy](#17-security-strategy)
18. [Parallel Development Strategy (3 Developers)](#18-parallel-development-strategy-3-developers)
19. [Development Roadmap](#19-development-roadmap)

---

## 1. High-Level System Architecture

Prossignment Portal is a **decoupled two-application system** sharing one database of record. The frontend is a pure presentation client; Laravel is the single source of truth.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT (Browser)                            │
│   Next.js App Router · TypeScript · Tailwind · ShadCN · Framer Motion       │
│   ─ Presentation only: rendering, UI state, form validation, API calls ─    │
└───────────────┬───────────────────────────────────────────────────────────┘
                │  HTTPS (JSON REST, httpOnly cookie auth)
                │  /api/v1/*        +  /sanctum/csrf-cookie
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          LARAVEL API (Single Source of Truth)               │
│                                                                             │
│   ┌─────────────────── PRESENTATION LAYER (HTTP) ───────────────────────┐   │
│   │  Routes → Middleware → Form Requests → Controllers → API Resources  │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   ▼                                          │
│   ┌─────────────────── BUSINESS LOGIC LAYER ────────────────────────────┐   │
│   │  Services · Actions · Policies · Events/Listeners · Jobs · DTOs      │   │
│   │  (ALL domain rules, the assignment state machine, orchestration)     │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   ▼                                          │
│   ┌─────────────────── DATA ACCESS LAYER ───────────────────────────────┐   │
│   │  Repositories (interfaces + Eloquent impl) · Models · Query objects  │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                     ▼
              ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐
              │ PostgreSQL   │  │ File Storage │  │ Queue / Cache            │
              │ (source of   │  │ (local → S3  │  │ (DB or Redis; async      │
              │  truth)      │  │  compatible) │  │  jobs, notifications)    │
              └──────────────┘  └──────────────┘  └─────────────────────────┘

  FUTURE-READY (V2, no rewrite):  Laravel Reverb / WebSockets ─▶ live chat,
  live notifications, live assignment status. Wired via existing Events layer.
```

**Core principle:** The frontend never contains business rules. Every decision ("can this writer be assigned?", "is this revision allowed?") is answered by Laravel. The frontend only reflects state and collects input.

---

## 2. Module Dependency Diagram

Modules are grouped into **domains**. Arrows mean "depends on / references". We deliberately keep dependencies shallow and one-directional to enable parallel work.

```
                         ┌────────────────────┐
                         │   IDENTITY (core)  │  ← foundation, everyone depends on it
                         │  Auth · Users ·    │
                         │  Roles · RBAC      │
                         └─────────┬──────────┘
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                     ▼
      ┌──────────────┐    ┌────────────────┐     ┌────────────────┐
      │    LEADS     │──▶ │  ASSIGNMENTS   │ ◀── │    CLIENTS     │
      │              │    │ (state machine)│     │                │
      └──────────────┘    └───┬───────┬────┘     └────────────────┘
                              │       │
             ┌────────────────┘       └───────────────┐
             ▼                                         ▼
     ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
     │     FILES      │   │   MESSAGING    │   │    FINANCE     │
     │ (versioning,   │   │  (chat, voice, │   │ (invoices,     │
     │  voice notes)  │   │   attachments) │   │  payments)     │
     └────────────────┘   └────────────────┘   └───────┬────────┘
                                                        ▼
   ┌──────────────────── CROSS-CUTTING (used by all) ─────────────────────┐
   │  Notifications · Audit Logs · Search · Reports/Analytics · Settings   │
   │  Tasks · Calendar · Complaints · Ratings · Document Templates         │
   └───────────────────────────────────────────────────────────────────────┘

Dependency rules:
  • IDENTITY depends on nothing (except framework).
  • ASSIGNMENTS is the central aggregate; Files/Messaging/Finance attach to it.
  • Cross-cutting modules communicate via EVENTS, not direct calls, wherever
    possible (e.g. AssignmentSubmitted event → NotificationListener), so a dev
    can work on Notifications without touching Assignments internals.
```

---

## 3. Frontend Architecture

**Feature-based (vertical slice) architecture.** Each feature is a self-contained mini-application. Nothing crosses feature boundaries except through `shared/` and typed API contracts.

### Layered view inside the frontend

```
┌────────────────────────────────────────────────────────────────┐
│ PRESENTATION   app/ (routes, layouts) + features/*/components    │
│                ShadCN + Tailwind + Framer Motion                 │
├────────────────────────────────────────────────────────────────┤
│ APPLICATION    features/*/hooks  (React Query hooks, view logic) │
│                contexts/ providers/ (auth, theme, RBAC gates)    │
├────────────────────────────────────────────────────────────────┤
│ DOMAIN/CONTRACT features/*/types + features/*/validation (Zod)   │
├────────────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE features/*/services (API calls) → lib/api-client  │
│                (single Axios instance: cookies, CSRF, intercept) │
└────────────────────────────────────────────────────────────────┘
```

### Anatomy of one feature (mandatory shape)

```
features/assignment/
├── components/       # UI specific to assignments (AssignmentCard, StatusBadge…)
├── hooks/            # useAssignments(), useAssignmentDetail(), useAssignMutation()
├── services/         # assignmentService.ts → typed calls to /api/v1/assignments
├── types/            # Assignment, AssignmentStatus, AssignmentDTO
├── validation/       # createAssignmentSchema (Zod)
├── constants/        # ASSIGNMENT_STATUSES, PRIORITY_OPTIONS
├── utils/            # formatDeadline(), canRequestRevision()
└── README.md         # purpose, data flow, API endpoints, dependencies
```

**Rules:**

- A feature imports from `shared/`, `lib/`, `components/ui/` — **never** from another feature's internals.
- Cross-feature reuse ⇒ promote to `shared/` or `components/`.
- Route files in `app/` are **thin**: they compose feature components and providers, nothing more.

---

## 4. Backend Architecture

Strict 3-tier with the **Repository + Service** pattern. Controllers are transport adapters only.

```
Route ──▶ Middleware ──▶ FormRequest (validate) ──▶ Controller (thin)
                                                        │
                                                        ▼
                                              Service (business logic)
                                       ┌────────────────┼─────────────────┐
                                       ▼                ▼                 ▼
                                 Repository        Events/Jobs        Policies
                                       │           (async, decoupled)  (authz)
                                       ▼
                                    Model (Eloquent) ──▶ PostgreSQL
                                       │
Controller ◀── Service returns DTO/Model ──▶ API Resource (JSON shape) ──▶ Response
```

### Directory intent (per module)

```
app/
├── Http/
│   ├── Controllers/Api/V1/     # thin, one action-group per resource
│   ├── Requests/               # validation + authorize()
│   ├── Resources/              # response transformers (JSON contract)
│   └── Middleware/             # auth, role, rate-limit, request-id
├── Services/                   # business logic (AssignmentService…)
├── Repositories/
│   ├── Contracts/              # interfaces (bound in a ServiceProvider)
│   └── Eloquent/               # implementations
├── Models/                     # Eloquent models + relations
├── Policies/                   # per-model authorization
├── Enums/                      # AssignmentStatus, Role, PaymentStatus (PHP enums)
├── Events/ · Listeners/        # domain events (decoupling backbone)
├── Jobs/                       # queued work (emails, file processing)
├── Notifications/              # in-app + mail channels
├── Observers/                  # model lifecycle hooks (audit, defaults)
├── DTOs/                       # typed data carriers between layers
└── Traits/                     # reusable behavior (HasUuid, Auditable…)
```

**Controller law:** a controller method may only (1) receive a validated request, (2) call one service method, (3) return a Resource. If it does more, it's a bug.

---

## 5. Request Lifecycle

End-to-end trace of a typical authenticated write (e.g. "PM assigns a writer"):

```
 1. Browser (Next.js) ── POST /api/v1/assignments/42/assign  { writerId: 9 }
      headers: Cookie(session), X-XSRF-TOKEN
        │
 2. CORS + Sanctum stateful middleware  → session resolved to User
 3. auth:sanctum middleware             → 401 if not authenticated
 4. role/permission middleware          → 403 if not PM/Admin (coarse gate)
 5. AssignWriterRequest (FormRequest)   → validates body + authorize() policy check
        │  (fine-grained: can THIS pm assign on THIS assignment?)
 6. AssignmentController@assign (thin)   → calls AssignmentService::assignWriter()
 7. AssignmentService
        ├─ loads assignment via AssignmentRepository
        ├─ enforces state machine (must be in PENDING_ASSIGNMENT)
        ├─ updates state → ASSIGNED (inside DB transaction)
        ├─ persists via repository
        └─ dispatches WriterAssigned event
 8. Listeners (async/queued):
        ├─ NotifyWriterListener      → Notification (in-app + mail)
        └─ WriteAuditLogListener     → audit_logs entry
 9. AssignmentResource transforms model → standardized JSON envelope
10. Response 200 { data: {...}, meta: {...} }
        │
11. Frontend: React Query invalidates ['assignments', 42] → UI re-renders,
    toast "Writer assigned", Framer Motion status-badge transition.
```

---

## 6. Authentication Flow

**Laravel Sanctum, cookie-based (stateful SPA).** No tokens in JS/localStorage → immune to XSS token theft.

```
 LOGIN
 ─────
 1. Frontend GET /sanctum/csrf-cookie        → sets XSRF-TOKEN cookie
 2. Frontend POST /api/v1/auth/login { email, password, remember }
        → Laravel verifies, starts session, sets httpOnly session cookie
        → returns current user + role + permissions
 3. Subsequent requests auto-send httpOnly cookie + X-XSRF-TOKEN header
        → Sanctum resolves session to authenticated User

 SESSION / REMEMBER ME
 ─────────────────────
   • "remember" → longer-lived session (config-driven).
   • Session expiration → API returns 401 → Axios interceptor → redirect /login.
   • Refresh handled by session lifetime + sliding activity (config).

 LOGOUT → POST /api/v1/auth/logout → invalidate session + clear cookies.

 FUTURE SOCIAL LOGIN (no rewrite)
 ────────────────────────────────
   AuthService is provider-agnostic. Add Laravel Socialite drivers:
   /api/v1/auth/{provider}/redirect  and  /callback  →  same session issuance.
   Frontend only adds "Continue with Google/Microsoft" buttons.
```

Cookie hardening: `HttpOnly`, `Secure` (prod), `SameSite=Lax`, CSRF double-submit via Sanctum.

---

## 7. Authorization Flow (RBAC)

**Two-level authorization**, fully database-driven — **no hardcoded permissions**.

```
LEVEL 1 — Coarse (route/middleware): "Is this role allowed near this area?"
LEVEL 2 — Fine  (Policy/Service):    "Can THIS user act on THIS record?"

Data model (DB-driven):
  roles ──< role_permissions >── permissions
  users >──< user_roles (or users.role_id for single-role) ── roles
  → effective permissions computed & cached per user.

Request → middleware checks permission slug (e.g. 'assignment.assign')
        → Policy checks ownership/context (e.g. PM owns this assignment's project)
        → Service re-validates invariants (defense in depth)
```

**Role matrix (summary — full matrix in Phase 4/5):**

| Capability         | Admin |   PM    |    Writer    |    Client    |
| ------------------ | :---: | :-----: | :----------: | :----------: |
| Manage users/roles |  ✅   |    —    |      —       |      —       |
| Create assignment  |  ✅   |   ✅    |      —       |      ✅      |
| Assign writer      |  ✅   |   ✅    |      —       |      —       |
| Submit work        |  ✅   |    —    |      ✅      |      —       |
| Request revision   |  ✅   |   ✅    |      —       |      ✅      |
| View finance (all) |  ✅   | partial | own earnings | own invoices |

Frontend mirrors this with **RBAC gate components** (`<Can permission="assignment.assign">`) — but this is UX only; the backend is the real enforcer.

---

## 8. Database Layer Strategy

- **PostgreSQL** as single source of truth. All access through **Repositories** (interface + Eloquent implementation), bound via a `RepositoryServiceProvider` for dependency injection and testability.
- **Migrations** are the schema source of truth; every table indexed and constrained deliberately (full ERD in Phase 4).
- **UUIDs** for public-facing IDs (safe to expose in URLs/APIs); internal FKs may use bigint for performance — decided per table in Phase 4.
- **Transactions** wrap all multi-write business operations (state changes, finance).
- **Soft deletes** on business records (assignments, users, invoices) for auditability.
- **Enums** (PHP + PG check constraints) for statuses to keep state machines honest.
- **No business logic in models** beyond relations, casts, and scopes.

---

## 9. File Management Strategy

Provider-independent via **Laravel Storage (Flysystem)**. A dedicated **FileService** owns all file behavior so business modules never touch storage directly.

```
FileService responsibilities:
  • upload()      — validate type/size, virus-scan hook, store, create file record
  • version()     — new version keeps history; old versions retained
  • preview()     — signed temporary URL (no public buckets)
  • download()    — authorized, audited, signed URL
  • attach()      — polymorphic link to Assignment / Message / Complaint
  • migrate()     — swap disks (local → S3/R2/Spaces/MinIO) with zero logic change

Storage config (env-driven): FILESYSTEM_DISK=local (dev) → s3 (prod)
Supported: pdf, doc(x), ppt(x), zip, images, audio/voice notes.
Metadata: original name, mime, size, version, uploader, tags, notes.
Access: ALWAYS via signed URLs + policy checks. Never public.
```

---

## 10. API Structure

- **Versioned:** all endpoints under `/api/v1/`. Breaking changes ⇒ `/api/v2/`.
- **Resource-oriented REST**, plural nouns, standard verbs, sub-resources for relations.
- **Standardized response envelope** (every response, success or error):

```jsonc
// success
{ "data": { ... }, "meta": { "pagination": { ... } } }

// error
{ "error": { "code": "ASSIGNMENT_INVALID_STATE",
             "message": "Human readable",
             "details": { "field": ["reason"] } },
  "meta": { "requestId": "uuid" } }
```

- **Conventions:** pagination (`?page`, `?per_page`), filtering (`?filter[status]=`), sorting (`?sort=-created_at`), sparse includes (`?include=writer,files`).
- **Documented** via OpenAPI + Postman collection (in `postman/`), kept in sync (see §13).

Endpoint families (illustrative): `auth`, `users`, `roles`, `leads`, `assignments`, `assignments/{id}/messages`, `assignments/{id}/files`, `invoices`, `payments`, `notifications`, `reports`, `search`.

---

## 11. Folder Structure (High Level)

Full tree is delivered in **Phase 3**. Monorepo top level:

```
prossignment-portal/            (== D:\Saad\Pro assignment)
├── frontend/          # Next.js app (feature-based)
├── backend/           # Laravel API (3-tier, modular)
├── docs/              # architecture, api, db, guides  ◀ this file lives here
├── database-design/   # ERD, SQL, data dictionary
├── postman/           # API collections/environments
├── assets/            # logos, UI references
├── scripts/           # setup & automation
└── README.md          # entry point / onboarding
```

---

## 12. Naming Conventions

| Context                   | Convention                | Example                                     |
| ------------------------- | ------------------------- | ------------------------------------------- |
| Frontend folders/features | kebab-case                | `features/assignment-chat/`                 |
| React components          | PascalCase                | `AssignmentCard.tsx`                        |
| Hooks                     | camelCase `use*`          | `useAssignments.ts`                         |
| TS types/interfaces       | PascalCase                | `Assignment`, `AssignmentStatus`            |
| TS constants              | UPPER_SNAKE               | `ASSIGNMENT_STATUSES`                       |
| Zod schemas               | camelCase `*Schema`       | `createAssignmentSchema`                    |
| API routes                | kebab plural              | `/api/v1/assignment-files`                  |
| Laravel classes           | PascalCase + suffix       | `AssignmentService`, `AssignmentRepository` |
| Laravel Enums             | PascalCase / cases UPPER  | `AssignmentStatus::PENDING_ASSIGNMENT`      |
| DB tables                 | snake_case plural         | `assignment_files`                          |
| DB columns                | snake_case                | `assigned_writer_id`                        |
| Pivot tables              | singular_singular (alpha) | `role_permission`                           |
| Env vars                  | UPPER_SNAKE               | `FILESYSTEM_DISK`                           |

No magic numbers, no hardcoded strings — everything in `constants/` (FE) or `Enums/`/config (BE).

---

## 13. Shared Types Strategy

Frontend (TS) and backend (PHP) cannot share code directly, so the **API contract is the shared type**:

```
Source of truth: Laravel API Resources + FormRequests
        │  (documented as OpenAPI spec — generated in backend)
        ▼
openapi.json  ──▶  frontend: `openapi-typescript` generates  types/api.d.ts
        │
        ▼
Feature `types/` extend/re-export generated API types (never hand-drift core shapes)
```

- Backend owns the contract; frontend **consumes generated types** → no manual drift.
- Zod schemas on the frontend validate the _same_ shapes at runtime (defense + UX).
- Any contract change ⇒ regenerate types ⇒ TypeScript compile errors surface breakage immediately. This is a key safety net for 3 parallel devs.

---

## 14. State Management Strategy

Deliberately minimal and layered — **no Redux**.

| State kind                                            | Tool                               | Why                                                                   |
| ----------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| **Server state** (all API data)                       | **TanStack Query (React Query)**   | caching, invalidation, polling (→ realtime later), optimistic updates |
| **Global UI state** (theme, sidebar, command palette) | **Zustand**                        | tiny, no boilerplate                                                  |
| **Auth/session + permissions**                        | **React Context** (`AuthProvider`) | app-wide, read-often                                                  |
| **Form state**                                        | **React Hook Form + Zod**          | performance + typed validation                                        |
| **URL state** (filters, tabs, pagination)             | **Next.js searchParams**           | shareable, back-button friendly                                       |

Polling lives inside React Query hooks; when Reverb ships, we swap the query's refetch trigger for a socket event — **components don't change**.

---

## 15. Error Handling Strategy

```
BACKEND
  • Central exception handler → standardized error envelope (§10).
  • Typed domain exceptions (e.g. InvalidAssignmentStateException) → mapped
    to HTTP status + machine `code`.
  • Validation errors → 422 with field details.
  • Every error carries requestId (correlates with logs).

FRONTEND
  • Axios response interceptor: 401→login, 403→forbidden UI, 422→form errors,
    5xx→toast + retry option.
  • React Query onError → toast; per-mutation error mapping to fields.
  • React Error Boundaries per route segment → professional error states.
  • Never show raw errors to users; map `code`→friendly message.
```

---

## 16. Logging Strategy

```
BACKEND (structured, JSON, Monolog channels)
  • request channel  — method, path, userId, requestId, duration, status
  • audit channel    — who did what to which record (also persisted to
                       audit_logs table for in-app Activity Timeline)
  • error channel    — stack + context + requestId
  • security channel — auth failures, permission denials, rate-limit hits
  • queue/job channel — async work outcomes
  Every log line carries requestId + userId for tracing.

FRONTEND
  • Central logger util; Sentry-ready adapter (enabled via env in prod).
  • Never log secrets/PII to console in production builds.
```

---

## 17. Security Strategy

- **Auth:** Sanctum httpOnly cookies, CSRF (double-submit), `Secure`+`SameSite` in prod.
- **AuthZ:** DB-driven RBAC + Policies (defense in depth) + service-level invariants.
- **Input:** all writes validated by FormRequests (BE) and Zod (FE).
- **Injection:** Eloquent/parameter binding only; no raw string SQL.
- **XSS:** React escaping by default; sanitize any rich text; no `dangerouslySetInnerHTML` without sanitizer.
- **Files:** type/size allowlist, signed URLs, no public buckets, virus-scan hook point.
- **Transport:** HTTPS enforced; HSTS in prod.
- **Rate limiting:** per-route throttles (login, search, uploads).
- **Secrets:** `.env` only, never committed; `.env.example` documents keys.
- **Passwords:** bcrypt/argon2id; breach-safe policies.
- **CORS:** strict allowlist of frontend origin(s); credentials enabled.
- **Audit:** every sensitive action logged + persisted.
- **Headers:** security headers (CSP-ready, X-Frame-Options, etc.).

---

## 18. Parallel Development Strategy (3 Developers)

**Goal:** three developers ship simultaneously with near-zero merge conflicts.

### Ownership map

```
DEV A — IDENTITY & PLATFORM
  Backend:  Auth (Sanctum), Users, Roles, Permissions/RBAC, Settings, Audit base
  Frontend: (auth) routes, dashboard shell/layout, sidebar/nav, theme, RBAC gates,
            shared design-system wiring (ShadCN setup), settings feature

DEV B — ASSIGNMENT CORE
  Backend:  Leads, Assignments (state machine), Files/FileService, Messaging/Chat,
            Notifications
  Frontend: leads, assignment, assignment-chat, files, notifications features

DEV C — BUSINESS OPS
  Backend:  Finance/Invoices/Payments, Reports, Analytics, Calendar, Tasks,
            Complaints, Ratings
  Frontend: finance, reports, analytics, calendar, tasks features
```

### Conflict-avoidance rules

1. **Feature folders are private property** — you only edit your own feature/module folders.
2. **Shared surfaces are change-controlled** — edits to `shared/`, `components/ui/`, routes provider, `RepositoryServiceProvider`, migrations index → require a short PR review from affected owner.
3. **Communication via Events/API contracts**, not direct imports — Dev C's Finance listens to Dev B's `AssignmentCompleted` event; neither edits the other's code.
4. **Migrations are additive & timestamped** — never edit a merged migration; add a new one. One shared "schema owner" (Dev A) sequences foundational tables in Phase 4 so FKs exist before dependents.
5. **Contract-first** — endpoints + response shapes agreed and stubbed (mock/Resource) before deep work, so frontend and backend of a feature proceed in parallel against the contract.
6. **Branching:** trunk-based, short-lived feature branches `feat/<domain>/<slug>`, PR + review, small commits.
7. **Definition of Done** per feature: code + tests + feature README + Postman entry + types regenerated.

---

## 19. Development Roadmap

Aligned to your 12-phase process; Phases 1–2 are the planning gate.

```
✅ Phase 1  Requirements            (approved)
🔵 Phase 2  System Architecture     (this document — awaiting approval)
   Phase 3  Folder Structure        full monorepo tree + every folder README
   Phase 4  Database Design         ERD, tables, keys, indexes, constraints, RBAC data
   Phase 5  API Planning            endpoint catalog, request/response contracts, OpenAPI
   Phase 6  UI/UX Planning          IA, navigation, page inventory, design tokens, states
   Phase 7  Component Library       ShadCN setup + shared components + motion primitives
   Phase 8  Backend Development     module by module (Identity → Assignments → Ops)
   Phase 9  Frontend Development    feature by feature against contracts
   Phase 10 Testing                 unit (services/repos), feature (API), E2E (critical flows)
   Phase 11 Documentation           finalize dev guide, API docs, onboarding
   Phase 12 Deployment              env config, CI/CD plan, storage/queue provisioning
```

**Suggested build sequence (post-planning):** Identity/RBAC → Design System/Shell → Assignments core + workflow → Files + Messaging → Finance → Analytics/Reports → Notifications polish → Testing/Docs/Deploy. Each vertical slice is shippable and demoable.

---

_End of Phase 2. Awaiting approval to proceed to Phase 3 — Folder Structure._
