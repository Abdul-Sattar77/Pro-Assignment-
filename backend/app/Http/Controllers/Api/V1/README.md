# app/Http / Controllers / Api / V1

PRESENTATION LAYER. Thin controllers under /api/v1. A method may only: (1) receive a validated request, (2) call ONE service method, (3) return a Resource. No business logic, no queries.

> Layer & conventions: see docs/architecture/02-system-architecture.md and docs/conventions/backend-standards.md.
