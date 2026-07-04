# Prossignment Portal

> Enterprise Assignment-Management ERP — a premium SaaS platform that replaces WhatsApp, Excel, and scattered file-sharing with one centralized system.

Monorepo containing the Next.js frontend, Laravel API backend, and all project documentation.

---

## 🧭 Repository Map

| Folder                                  | Purpose                                                                      | Owner  |
| --------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| [`frontend/`](./frontend)               | Next.js + TypeScript + Tailwind + ShadCN + Framer Motion (presentation only) | FE     |
| [`backend/`](./backend)                 | Laravel API — 3-tier, source of truth, PostgreSQL                            | BE     |
| [`docs/`](./docs)                       | Architecture, conventions, design system, API & Git standards                | All    |
| [`database-design/`](./database-design) | ERD, SQL, data dictionary                                                    | Dev A  |
| [`postman/`](./postman)                 | API collections + environments                                               | BE     |
| [`assets/`](./assets)                   | Logos, brand, UI references                                                  | Design |
| [`scripts/`](./scripts)                 | Setup & automation scripts                                                   | DevOps |

## 🏗️ Architecture (at a glance)

Decoupled two-app system, single source of truth:

```
Next.js (presentation only) ──HTTPS/JSON + Sanctum cookie──▶ Laravel API
                                                              ├ Presentation (HTTP)
                                                              ├ Business Logic (Services)
                                                              └ Data Access (Repositories) ─▶ PostgreSQL
```

Full detail: [`docs/architecture/02-system-architecture.md`](./docs/architecture/02-system-architecture.md)

## 📚 Start Here (new developers)

1. [`docs/architecture/02-system-architecture.md`](./docs/architecture/02-system-architecture.md) — how the system fits together
2. [`docs/conventions/README.md`](./docs/conventions/README.md) — coding standards (must-read)
3. [`docs/design-system/design-system.md`](./docs/design-system/design-system.md) — the UI language
4. [`docs/api/api-standards.md`](./docs/api/api-standards.md) — API contract rules
5. [`docs/git/git-workflow.md`](./docs/git/git-workflow.md) — branching, commits, PRs

## 🛠️ Tech Stack

**Frontend:** Next.js (App Router), TypeScript (strict), Tailwind CSS, ShadCN UI, Framer Motion, TanStack Query, Zustand, React Hook Form + Zod.
**Backend:** Laravel (latest), Sanctum (cookie auth), Service + Repository pattern.
**Database:** PostgreSQL.

## 🚀 Getting Started

See [`scripts/`](./scripts) and each app's README:

- Frontend → [`frontend/README.md`](./frontend/README.md)
- Backend → [`backend/README.md`](./backend/README.md)

## 👥 Team & Ownership

| Dev   | Domain                                                                |
| ----- | --------------------------------------------------------------------- |
| **A** | Identity, Auth, Users, RBAC, Dashboard shell, Design system, Settings |
| **B** | Leads, Assignments, Files, Messaging, Notifications                   |
| **C** | Finance, Reports, Analytics, Calendar, Tasks                          |

Ownership & conflict rules: [`docs/git/git-workflow.md`](./docs/git/git-workflow.md).

---

_Version 1 is single-tenant, architected to become multi-tenant without rewrites — see [`docs/architecture/03-future-proofing-and-multitenancy.md`](./docs/architecture/03-future-proofing-and-multitenancy.md)._
