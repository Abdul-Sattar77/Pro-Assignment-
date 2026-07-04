# Future-Proofing & Multi-Tenancy Readiness (Architecture Addendum)

> **Status:** Approved addendum to `02-system-architecture.md`
> **Rule:** V1 is **single-tenant**. We do **NOT** build multi-tenancy now. We only make decisions that keep the door open. Every item below is a _readiness_ decision, not a feature.

---

## 1. Why this matters

Retrofitting multi-tenancy into a system that assumed a single organization is one of the most expensive rewrites in software. A few cheap decisions now (naming, a nullable column, scoping through one place) mean that adding tenants later is an **additive migration**, not a re-architecture.

---

## 2. Multi-Tenancy Strategy (chosen for the future): **Shared DB, Row-Level Isolation**

When we do add tenancy, we will use a single PostgreSQL database with a `tenant_id` (organization) column on tenant-owned tables, enforced by a global query scope. This is the cheapest path to prepare for.

```
FUTURE (V2+):
  organizations (tenants)
        │ 1
        │ ──< users, assignments, invoices, files, ... (all carry organization_id)
        ▼
  Global scope auto-filters every query by current tenant.
  PostgreSQL Row-Level Security (RLS) as a second safety net.
```

---

## 3. Readiness decisions we take NOW (cheap, non-blocking)

| #   | Decision                                       | What we do in V1                                                                                                                                          | Why it future-proofs                                                                            |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Tenant boundary lives in ONE place**         | All data access goes through **Repositories**. Query scoping has a single choke point.                                                                    | Adding a tenant filter = editing one base repository/scope, not 100 queries.                    |
| 2   | **Public IDs are UUIDs**                       | Expose UUIDs in URLs/APIs.                                                                                                                                | Prevents cross-tenant ID guessing; no sequential-ID leak when tenants arrive.                   |
| 3   | **No global uniqueness assumptions**           | Treat uniqueness as _scoped_ conceptually (e.g. an email/invoice-number is unique — later "unique per organization"). Document this intent in migrations. | Uniqueness constraints can shift to composite `(organization_id, x)` via additive migration.    |
| 4   | **Config is not hardcoded to "the org"**       | Org name, logo, branding, currency, timezone read from a `settings`/`organization_settings` table — not `.env` or constants.                              | Becomes per-tenant settings for free.                                                           |
| 5   | **Storage paths are namespaced**               | File paths structured as `assignments/{assignmentId}/...` (already ID-scoped).                                                                            | Later prefix `tenants/{tenantId}/...` without touching business logic (FileService owns paths). |
| 6   | **Auth resolves a "current context"**          | An `AppContext`/`CurrentUser` service resolves the acting user (and, later, their organization).                                                          | Tenant resolution slots into the same service — controllers/services never change.              |
| 7   | **RBAC is data-driven**                        | Roles/permissions already in DB.                                                                                                                          | Later scope roles per organization; model already supports it.                                  |
| 8   | **Events carry actor + context**               | Domain events include actor id (and a context object).                                                                                                    | Add tenant id to context later; listeners unaffected.                                           |
| 9   | **No cross-tenant aggregate reports baked in** | Reports query through repositories/services.                                                                                                              | Reports auto-scope when the repository scopes.                                                  |
| 10  | **Frontend reads identity from one provider**  | `AuthProvider` exposes `user` (later `user.organization`).                                                                                                | UI branding/tenant switch adds to one provider.                                                 |

---

## 4. What we explicitly DO NOT do in V1

- No `organizations` table, no `tenant_id` columns, no tenant middleware, no tenant switching UI.
- No premature abstraction "just in case." Readiness = clean seams, not speculative code.

---

## 5. Documented Future Extension Points

These seams are where V2 tenancy will attach. Each will be labeled `// FUTURE: multi-tenancy` in code when we reach it:

1. **Base repository / global scope** — the single place to inject `where organization_id = ?`.
2. **`AppContext` service** — resolve `currentOrganization()` alongside `currentUser()`.
3. **Migrations** — additive `organization_id` columns + composite unique indexes.
4. **FileService path builder** — prefix tenant namespace.
5. **Settings module** — promote to `organization_settings`.
6. **Auth/login** — associate user ↔ organization; optional org selector.
7. **API** — optional `X-Organization-Id` header / subdomain resolution.

---

## 6. Other future-proofing (beyond tenancy)

- **Realtime:** Events layer already exists → Reverb/WebSockets attach without touching modules (see `02-system-architecture.md §14`).
- **Social login:** Sanctum + provider-agnostic `AuthService` → Socialite drivers add later.
- **Storage provider swap:** Flysystem disks → local→S3/R2/Spaces/MinIO via env only.
- **API growth:** `/api/v1` versioning → `/v2` without breaking clients (see `api-standards.md`).
- **Search scale:** search behind a `SearchService` interface → swap DB search for Meilisearch/Elastic later.
- **Queue scale:** DB queue in V1 behind Laravel Queue abstraction → Redis/SQS later via env.

---

_This addendum is binding. Any code that hardcodes single-org assumptions outside the seams above must be flagged in code review._
