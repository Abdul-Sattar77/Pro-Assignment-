# app/Services

BUSINESS LOGIC LAYER. All domain rules, orchestration, transactions, and event dispatch live here. Controllers call services; services are the only place business decisions are made. One service per aggregate/domain (e.g. AuthService, AssignmentService). Group by domain in subfolders as they grow.

> Layer & conventions: see docs/architecture/02-system-architecture.md and docs/conventions/backend-standards.md.
