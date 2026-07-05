# app/Repositories / Contracts

DATA ACCESS LAYER (interfaces). One interface per repository, bound to an Eloquent implementation in RepositoryServiceProvider. Services depend on these interfaces, never on Eloquent directly — this keeps the domain testable and swappable.

> Layer & conventions: see docs/architecture/02-system-architecture.md and docs/conventions/backend-standards.md.
