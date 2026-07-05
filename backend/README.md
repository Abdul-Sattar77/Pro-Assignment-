# Backend — Prossignment Portal API (Laravel)

The Laravel API is the **single source of truth**. Strict 3-tier architecture:
**Presentation (HTTP) → Business Logic (Services) → Data Access (Repositories) → PostgreSQL.**

- Architecture: [`../docs/architecture/02-system-architecture.md`](../docs/architecture/02-system-architecture.md)
- Conventions: [`../docs/conventions/backend-standards.md`](../docs/conventions/backend-standards.md)
- API standards: [`../docs/api/api-standards.md`](../docs/api/api-standards.md)

## Stack

Laravel 13 · PHP 8.4 · PostgreSQL 17 · Sanctum (cookie SPA auth) · spatie/laravel-permission (RBAC) · spatie/laravel-activitylog (audit) · Pint · Larastan/PHPStan (level 6).

## Layer map (`app/`)

| Folder                                                          | Layer / Responsibility                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Http/Controllers/Api/V1`                                       | Presentation — thin controllers (validate → 1 service call → Resource)              |
| `Http/Requests` · `Http/Resources`                              | Request validation · JSON response contracts                                        |
| `Http/Middleware`                                               | Cross-cutting HTTP (request-id, …)                                                  |
| `Services`                                                      | **Business logic** — domain rules, transactions, events                             |
| `Repositories/Contracts` · `Repositories/Eloquent`              | **Data access** — interfaces + Eloquent impl (bound in `RepositoryServiceProvider`) |
| `Enums` · `DTOs` · `Traits`                                     | Value sets · typed carriers · reusable mixins                                       |
| `Events` · `Listeners` · `Jobs` · `Notifications` · `Observers` | Decoupling & async                                                                  |
| `Policies`                                                      | Fine-grained authorization                                                          |
| `Support`                                                       | `ApiResponse` (envelope), `ApiExceptionRenderer`                                    |
| `Exceptions`                                                    | Typed domain exceptions → HTTP + machine codes                                      |

Every subfolder has a `README.md` describing its responsibility.

## API conventions (enforced)

- Versioned under `/api/v1`. Standard response envelope `{ data, meta }`; errors `{ error: { code, message, details }, meta }`.
- Every response carries `meta.requestId` (also an `X-Request-Id` header) for tracing.
- Auth: Sanctum cookie SPA — `GET /sanctum/csrf-cookie` then `POST /api/v1/auth/login`.

### Implemented endpoints (Identity)

| Method | Path                    | Auth                  |
| ------ | ----------------------- | --------------------- |
| POST   | `/api/v1/auth/register` | public                |
| POST   | `/api/v1/auth/login`    | public (rate-limited) |
| POST   | `/api/v1/auth/logout`   | sanctum               |
| GET    | `/api/v1/auth/me`       | sanctum               |

## Roles & permissions

Four roles (`admin`, `project_manager`, `writer`, `client`) — enum `App\Enums\Role`. Permissions are data-driven (`resource.action`), seeded by `RolePermissionSeeder`. Never hardcode role/permission strings.

## Local setup

```bash
composer install
cp .env.example .env         # then set DB_PASSWORD and app secrets
php artisan key:generate
php artisan migrate --seed    # creates schema + RBAC + bootstrap admin
php artisan serve             # http://localhost:8000
```

**Bootstrap admin (dev only):** `admin@prossignment.test` / `password` — change before any non-local deploy.

### Environment

PostgreSQL via env (see `.env.example`). Keep it env-based so we can point at a VPS/managed Postgres (Neon, Supabase, RDS) with no code changes.

## Quality gates

```bash
composer pint          # format (Laravel preset)
composer pint:test     # check formatting (CI)
composer analyse       # PHPStan/Larastan level 6
composer test          # feature + unit tests
```

Definition of Done for any endpoint: FormRequest + Policy + Resource + test + OpenAPI/Postman + envelope compliance.
