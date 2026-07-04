# Coding Conventions — Index

> **Status:** Mandatory · **Audience:** All 3 developers
> **Rule:** Every developer follows the same conventions. When in doubt, this folder wins. If a convention is missing, propose it here via PR before inventing your own.

These conventions make the codebase feel like it was written by **one senior team**, not three people.

## Documents in this folder

| File                                                     | Covers                                             |
| -------------------------------------------------------- | -------------------------------------------------- |
| [`frontend-standards.md`](./frontend-standards.md)       | React, Next.js, TypeScript                         |
| [`backend-standards.md`](./backend-standards.md)         | Laravel, PostgreSQL, API design (in-code)          |
| [`engineering-standards.md`](./engineering-standards.md) | Testing, Security, Performance, Documentation, Git |

## Related canonical docs

- Architecture → [`../architecture/02-system-architecture.md`](../architecture/02-system-architecture.md)
- Future-proofing → [`../architecture/03-future-proofing-and-multitenancy.md`](../architecture/03-future-proofing-and-multitenancy.md)
- Design system → [`../design-system/design-system.md`](../design-system/design-system.md)
- API standards → [`../api/api-standards.md`](../api/api-standards.md)
- Git workflow → [`../git/git-workflow.md`](../git/git-workflow.md)

## Golden rules (apply everywhere)

1. **Documentation first** — no implementation before its phase's docs are approved.
2. **Isolation** — features/modules never reach into each other's internals; reuse via `shared/`.
3. **Thin controllers / dumb components** — logic lives in Services (BE) and hooks/services (FE).
4. **No duplication** — extract and reuse; DRY without over-abstracting.
5. **No magic values** — constants, enums, tokens; never hardcoded strings/numbers.
6. **Type everything** — TS strict (FE), typed enums/DTOs (BE).
7. **Small units** — small files, small functions, single responsibility.
8. **Everything documented** — every folder has a README stating its purpose.
9. **Accessible & responsive** — part of Definition of Done for any UI.
10. **Secure by default** — validate input, enforce authz, never trust the client.

## Naming conventions (canonical summary)

Full table in `../architecture/02-system-architecture.md §12`. Quick reference:

- FE folders/features: `kebab-case` · components: `PascalCase` · hooks: `useCamelCase` · constants: `UPPER_SNAKE`
- BE classes: `PascalCase` + suffix (`AssignmentService`) · enums: `PascalCase`/`CASE_UPPER`
- DB: tables `snake_case_plural`, columns `snake_case` · API: `/kebab-plural`, JSON keys `camelCase`
