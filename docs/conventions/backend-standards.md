# Backend Coding Standards — Laravel · PostgreSQL · API

> Applies to everything in `backend/`. Enforced by Laravel Pint (style) + PHPStan/Larastan (static analysis).

---

## 1. Laravel — layering (non-negotiable)

`Route → Middleware → FormRequest → Controller → Service → Repository → Model → DB`

- **Controllers are thin transport adapters.** A method may only: (1) receive a validated request, (2) call **one** service method, (3) return a Resource. No business logic, no queries, no conditionals about domain rules.
- **Services own business logic** — the assignment state machine, orchestration, transactions, event dispatch. Services are the only place domain decisions live.
- **Repositories own data access** — interface in `Repositories/Contracts`, Eloquent impl in `Repositories/Eloquent`, bound in `RepositoryServiceProvider`. Services depend on the **interface** (DI), never on Eloquent directly.
- **Models** hold relations, casts, scopes only — **no business logic**.

## 2. Laravel — components & when to use them

| Component            | Responsibility                                                  |
| -------------------- | --------------------------------------------------------------- |
| **FormRequest**      | validation rules + `authorize()`; one per write action          |
| **API Resource**     | response shape (the JSON contract); never leak model internals  |
| **Policy**           | per-model authorization (`can this user act on this record?`)   |
| **Service**          | business logic, orchestration, transactions                     |
| **Repository**       | all persistence/query logic                                     |
| **Enum** (PHP 8.1)   | statuses, roles, types — the source of truth for allowed values |
| **DTO**              | typed data carrier between layers when arrays get unclear       |
| **Event / Listener** | decouple side effects (notifications, audit, finance triggers)  |
| **Job**              | queued async work (email, file processing, PDF)                 |
| **Notification**     | in-app + mail (realtime-ready channel)                          |
| **Observer**         | model lifecycle (set defaults, write audit, uuid)               |
| **Middleware**       | cross-cutting HTTP (auth, role, throttle, request-id)           |
| **Trait**            | reusable model/behavior mixins (`HasUuid`, `Auditable`)         |

## 3. Laravel — coding rules

- **SOLID + Clean Code.** Single responsibility per class; small methods; intention-revealing names.
- **Dependency injection** via constructor/type-hints; no `new` for services/repos; no facades for domain logic inside services (inject instead) — facades OK at framework edges.
- **Transactions** wrap every multi-write operation (`DB::transaction`), especially state changes and finance.
- **Enums everywhere** for fixed sets — never magic strings for status/role/type.
- **Never** put queries in controllers or business logic in models/observers.
- **Config, not constants in code** for tunables (limits, timeouts) — `config/*.php` + env.
- **Money** as integer minor units + currency; never floats.
- **UUIDs** for public ids (`HasUuid` trait); timestamps UTC.
- **Return types & typed params** on all methods; PHPStan level enforced in CI.
- **No fat helpers** — organize by module; avoid a global `helpers.php` dumping ground.

## 4. Modularity & isolation

- Group each domain's classes so a developer owns a coherent slice (see `git-workflow.md` ownership).
- Cross-module communication prefers **Events** over direct service-to-service calls where it reduces coupling (e.g. Finance listens to `AssignmentCompleted`).
- Shared infra (base repository, base service, traits, `AppContext`) is change-controlled.

## 5. PostgreSQL & data

- **Migrations are the schema source of truth.** Additive and timestamped; **never edit a merged migration** — add a new one.
- Every table: explicit **PK** (UUID or bigint per Phase 4), sensible **FKs** with `on delete` behavior, **indexes** on FKs and frequent filters/sorts, **constraints** (not null, unique, check for enums), **timestamps**, **soft deletes** on business records.
- **Naming:** tables `snake_case_plural`, columns `snake_case`, pivots `singular_singular` (alphabetical), FKs `<singular>_id`.
- **Uniqueness** documented with future multi-tenant intent (see future-proofing addendum) — likely `(organization_id, x)` later.
- **No raw SQL string interpolation** — Eloquent/query builder with bindings only. Raw expressions require review.
- **Seeders & factories** for every table (dev data + tests).
- Avoid N+1: eager-load in repositories; `include` maps to `with()`.

## 6. API (in-code) — follow `api/api-standards.md`

- Versioned routes under `routes/api.php` → `/api/v1`; controllers in `Http/Controllers/Api/V1`.
- Standard response envelope + error envelope (central exception handler maps domain exceptions → HTTP + `code`).
- Pagination/filtering/sorting/includes only on whitelisted fields; unknown ⇒ 422.
- Every endpoint: FormRequest + Policy + Resource + feature test + OpenAPI/Postman entry.

## 7. Errors & exceptions

- **Typed domain exceptions** (e.g. `InvalidAssignmentStateException`) thrown by services; mapped centrally to HTTP status + machine `code` + safe message. Never leak stack traces/SQL to clients.
- Validation → 422 with field `details`. Authz → 403. Not found/not visible → 404.

## 8. Security (see `engineering-standards.md §Security`)

- Sanctum auth; CSRF; RBAC via middleware + policies + service invariants (defense in depth).
- Validate all input (FormRequest); mass-assignment guarded (`$fillable`); signed URLs for files; rate limits on sensitive routes; secrets in `.env` only.

## 9. Quality gates

- Pint (style) + PHPStan/Larastan (static analysis) clean in CI.
- Unit tests for services/repositories; feature tests for endpoints.
- Every module folder documented (purpose, data flow, events, dependencies).
