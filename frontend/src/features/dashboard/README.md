# Feature: Dashboard

**Owner:** Dev A · **Domain:** Identity

## Purpose

Role-aware dashboard overview with KPIs and recent activity.

## Responsibility

Owns everything for **dashboard**: feature UI, view-logic, API communication, and input
validation. Contains **no business rules** that belong to the backend — it reflects
server state and collects user input. The backend is the source of truth.

## Standard structure (created as the feature is built)

| Folder        | Responsibility                                     |
| ------------- | -------------------------------------------------- |
| `components/` | UI specific to this feature                        |
| `hooks/`      | React Query hooks & view logic (`useDashboard...`) |
| `services/`   | typed API calls via `@/lib/api-client`             |
| `types/`      | feature types (extend generated API types)         |
| `validation/` | Zod schemas                                        |
| `constants/`  | statuses, options, enums-as-const                  |
| `utils/`      | feature-only helpers                               |
| `index.ts`    | public surface of this feature                     |

## Data flow

`Component → hook (React Query) → service → @/lib/api-client → Laravel API`

## API

Endpoints: `/api/v1/{ dashboard }` — documented in `docs/api` once implemented.

## Isolation rule

Never import another feature's internals. Reuse via `@/components` or `@/lib`.
Cross-feature communication happens through the API only.
