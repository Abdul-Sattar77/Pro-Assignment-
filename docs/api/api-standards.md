# Prossignment Portal — API Standards

> **Status:** Foundational · **Owner:** Backend leads · **Applies to:** all `/api/*` endpoints
> **Rule:** The API is a public contract between 3 developers (and future clients). Consistency is non-negotiable. Extends `02-system-architecture.md §10`.

---

## 1. API Versioning Strategy

- **URI versioning:** every endpoint under `/api/v{n}/` (V1 = `/api/v1/`).
- A version is a **stability contract**: within `v1`, we only make **backward-compatible** changes.
- Breaking changes ⇒ new version (`/api/v2/`). Old version keeps running during the deprecation window.
- Only **major** breaking changes bump the version — additive changes never do.

## 2. Backward Compatibility Policy

**Safe (allowed within a version):**

- Add a new endpoint.
- Add a new **optional** request field.
- Add a new field to a response.
- Add a new optional query param / filter / include.
- Add a new enum value **only if** clients are documented to tolerate unknown values.

**Breaking (requires new version):**

- Remove/rename a field or endpoint.
- Change a field's type or meaning.
- Make an optional field required.
- Change default behavior, pagination shape, or error envelope.
- Tighten validation in a way that rejects previously-valid input.

## 3. Deprecation Strategy

1. Mark deprecated in OpenAPI (`deprecated: true`) + in `docs/api`.
2. Return a `Deprecation: true` + `Sunset: <date>` response header and a `meta.warnings[]` note.
3. Announce in `CHANGELOG` + notify frontend owner.
4. **Minimum 1 release window** (or agreed calendar time) before removal.
5. Remove only in a new major version.

## 4. API Lifecycle

```
Design (contract in OpenAPI) → Review → Stub (Resource + mock) →
Implement (Service+Repo) → Test (feature tests) → Document (OpenAPI + Postman) →
Release → Maintain → Deprecate → Remove (next major)
```

**Contract-first:** the OpenAPI entry + response Resource shape are agreed before implementation, so frontend and backend build in parallel.

## 5. Response Standards (envelope — every response)

```jsonc
// Single resource
{ "data": { "id": "uuid", "type": "assignment", ... },
  "meta": { "requestId": "uuid" } }

// Collection
{ "data": [ ... ],
  "meta": { "requestId": "uuid",
            "pagination": { "page": 1, "perPage": 20, "total": 137, "totalPages": 7 } } }

// Error
{ "error": { "code": "ASSIGNMENT_INVALID_STATE",
             "message": "This assignment cannot be assigned in its current state.",
             "details": { "status": ["Expected PENDING_ASSIGNMENT."] } },
  "meta": { "requestId": "uuid" } }
```

Rules: always an envelope; `data` never mixes with top-level meta; every response carries `meta.requestId` (traces to logs).

## 6. Error Standards

| HTTP | When                                | `error.code` example                        |
| ---- | ----------------------------------- | ------------------------------------------- |
| 400  | malformed request                   | `BAD_REQUEST`                               |
| 401  | not authenticated                   | `UNAUTHENTICATED`                           |
| 403  | authenticated, not allowed          | `FORBIDDEN`                                 |
| 404  | resource missing / not visible      | `NOT_FOUND`                                 |
| 409  | conflict / invalid state transition | `INVALID_STATE`, `CONFLICT`                 |
| 422  | validation failed                   | `VALIDATION_FAILED` (+ `details` per field) |
| 429  | rate limited                        | `RATE_LIMITED` (+ `Retry-After`)            |
| 500  | unexpected                          | `INTERNAL_ERROR` (no internals leaked)      |

- `code` is a stable machine string (frontend maps to friendly copy).
- `message` is human-readable and safe to display.
- `details` is field-keyed for 422.

## 7. Pagination Standards

- **Default:** page-based — `?page=1&per_page=20`. `per_page` max **100** (server clamps).
- Metadata always in `meta.pagination` (see §5).
- Cursor pagination reserved for high-volume/realtime feeds (e.g. chat, activity) — `?cursor=...&limit=...`, returns `meta.pagination.nextCursor`.
- Empty page returns `data: []` (never 404).

## 8. Filtering Standards

- Syntax: `?filter[field]=value`, multiple values `?filter[status]=in_review,completed`.
- Ranges: `?filter[created_at][gte]=...&filter[created_at][lte]=...`.
- Only **whitelisted** filterable fields per endpoint (documented). Unknown filter ⇒ 422.
- Free-text: `?search=` (endpoint-defined searchable columns).

## 9. Sorting Standards

- `?sort=field` (asc) or `?sort=-field` (desc); multiple: `?sort=-priority,created_at`.
- Only **whitelisted** sortable fields; unknown ⇒ 422. Default sort documented per endpoint (usually `-created_at`).

## 10. Sparse Includes (relations)

- `?include=writer,files,client` loads relations (whitelisted, prevents N+1 via eager loading).
- Field selection (optional): `?fields[assignment]=id,title,status`.

## 11. API Naming Conventions

- **Nouns, plural, kebab-case:** `/api/v1/assignment-files`.
- **Sub-resources for relations:** `/api/v1/assignments/{id}/messages`.
- **Verbs only for actions** that aren't CRUD, as a sub-path: `POST /assignments/{id}/assign`, `POST /assignments/{id}/submit`, `POST /invoices/{id}/verify-payment`.
- Standard CRUD → standard methods: `GET`(list/show) · `POST`(create) · `PATCH`(partial update) · `PUT`(replace, rare) · `DELETE`(soft delete).
- IDs in URLs are **UUIDs**.
- Timestamps ISO-8601 UTC; money as integer minor units + currency code (never floats).
- JSON keys **camelCase** (matches TS frontend); documented and consistent.

## 12. Authentication Standards

- **Sanctum cookie-based** (stateful SPA). Flow: `GET /sanctum/csrf-cookie` → `POST /api/v1/auth/login`.
- Protected routes: `auth:sanctum` middleware. Unauthenticated ⇒ 401 (never redirect from API).
- CSRF via `X-XSRF-TOKEN` on state-changing requests.
- Authorization (RBAC) is separate from authentication (see `02-system-architecture.md §7`).
- **Future:** Socialite (Google/Microsoft) + optional personal-access-tokens for external API consumers — additive, versionless.

## 13. Rate Limiting Strategy

- Global sensible default per authenticated user (e.g. 120 req/min) via named throttles.
- Tighter limits on sensitive routes: login (per IP+email), password reset, search, file upload.
- Exceeding ⇒ 429 + `Retry-After` header + `RATE_LIMITED` code.
- Limits are config-driven (tunable per environment), documented per route group.

## 14. Security Requirements (API)

- HTTPS only; strict CORS allowlist (frontend origin) with credentials.
- All writes validated by FormRequests; all queries via Eloquent (no raw SQL).
- No sensitive data in URLs/logs; `requestId` for tracing (see `conventions/engineering-standards.md`).
- Signed, expiring URLs for file access.

## 15. API Documentation Workflow

1. **OpenAPI is the source of truth**, generated from the backend (annotations/spec).
2. On every endpoint change: regenerate `openapi.json` → commit → frontend regenerates TS types (`openapi-typescript`).
3. **Postman collection** maintained in `/postman` (with an environment file) for manual testing — kept in sync with OpenAPI.
4. Human-readable guides live in `docs/api/` (auth, pagination, errors, per-module endpoint catalogs — produced in Phase 5).
5. **Definition of Done** for any endpoint: OpenAPI updated + Postman entry + TS types regenerated + feature test.

---

_Endpoint catalog and per-module contracts are produced in Phase 5 — API Planning._
