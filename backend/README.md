# Backend — Laravel API

The Laravel application (single source of truth) is scaffolded here.

**Architecture:** strict 3-tier — Presentation (HTTP) → Business Logic (Services) → Data Access (Repositories) → PostgreSQL.
See [`../docs/architecture/02-system-architecture.md`](../docs/architecture/02-system-architecture.md) and [`../docs/conventions/backend-standards.md`](../docs/conventions/backend-standards.md).

**Auth:** Laravel Sanctum (cookie-based). **DB:** PostgreSQL. **API:** versioned under `/api/v1`.

> Scaffolding pending backend toolchain install (PHP + Composer + PostgreSQL).
