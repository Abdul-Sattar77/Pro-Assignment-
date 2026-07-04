# Prossignment Portal — Git Workflow

> **Status:** Mandatory · **Audience:** All 3 developers
> **Goal:** Three developers ship in parallel with minimal merge conflicts and maximum speed. Consistency and small PRs are the levers.

---

## 1. Repository Strategy

- **Single monorepo** (`frontend/`, `backend/`, `docs/`, …).
- **Trunk-based, with short-lived feature branches.** `main` is always releasable.
- Long-lived branches: `main` (production-ready) and optionally `develop` (integration) — **we use `main` + short feature branches** to keep it simple for 3 devs. (`develop` only if the team later wants a staging integration branch.)
- **Protected `main`:** no direct pushes; PR + review + green CI required.

## 2. Branch Naming

```
<type>/<scope>/<short-slug>

feat/assignment/create-workflow
feat/finance/invoice-pdf
fix/chat/unread-count
chore/ci/add-eslint
docs/api/pagination-guide
refactor/files/file-service
hotfix/auth/session-expiry
release/v1.2.0
```

- `type`: feat · fix · chore · docs · refactor · test · perf · hotfix · release.
- `scope`: the module/feature (matches folder ownership).
- Keep branches **small and short-lived** (ideally < a few days).

## 3. Feature Branch Workflow

```
1. git checkout main && git pull
2. git checkout -b feat/<scope>/<slug>
3. Commit small, logical units (Conventional Commits).
4. Rebase on main frequently:  git fetch && git rebase origin/main
5. Push, open PR early (draft is fine) for visibility.
6. CI green + 1 review approval → squash-merge → delete branch.
```

**Ownership reminder:** you edit your own feature/module folders. Touching shared surfaces (`shared/`, `components/ui/`, providers, `RepositoryServiceProvider`, foundational migrations, design tokens) requires the affected owner's review.

## 4. Release Branch Workflow

```
1. Cut release/vX.Y.0 from main when scope is frozen.
2. Only stabilization commits (bugfix/docs) go in.
3. Tag vX.Y.0, merge back to main.
4. Deploy from the tag.
```

For a small team, releases can also be **tag-on-main** if no stabilization period is needed.

## 5. Hotfix Workflow

```
1. Branch hotfix/<scope>/<slug> from main (or the released tag).
2. Minimal fix + test.
3. Fast-track review → merge → tag patch (vX.Y.Z) → deploy.
```

## 6. Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body — what & why, not how]
[optional footer — BREAKING CHANGE:, Refs #id]
```

Types: `feat · fix · docs · style · refactor · perf · test · build · ci · chore · revert`.
Examples:

```
feat(assignment): add writer assignment endpoint
fix(chat): correct unread counter after mark-as-read
refactor(files): extract signed-url logic into FileService
docs(api): document pagination standards
feat(auth)!: switch session cookie to SameSite=strict

BREAKING CHANGE: clients must re-authenticate.
```

Rules: imperative mood, ≤ 72-char subject, no trailing period, `!` or `BREAKING CHANGE:` footer for breaks. Commit types drive the changelog and versioning.

## 7. Pull Request Process

- **Small PRs** (ideally < ~400 lines diff). One concern per PR.
- PR template must include: **what changed, why, how to test, screenshots (UI), checklist**.
- Link the issue/task. Draft PR early for visibility.
- CI must pass (lint, typecheck, tests, build) before review.
- **≥ 1 approval** to merge; changes to shared surfaces need the owner's approval.
- **Squash-merge** into `main` (clean, linear history); PR title follows Conventional Commits (becomes the squash commit).

## 8. Code Review Checklist (reviewer)

**Correctness**

- [ ] Does what the PR says; edge cases handled; no obvious bugs.
- [ ] Business logic in Services (not controllers/components); data access in Repositories.
      **Architecture & conventions**
- [ ] Respects 3-tier layering and feature isolation (no cross-feature imports).
- [ ] Follows naming + folder conventions; no duplicated logic (reuse `shared/`).
- [ ] No magic numbers/hardcoded strings; tokens/enums/constants used.
      **API & types**
- [ ] Response envelope + error standard followed; OpenAPI + Postman updated; TS types regenerated.
      **UI (if applicable)**
- [ ] Uses design tokens/components; light+dark; responsive; a11y (focus, contrast, keyboard); loading/empty/error states.
      **Security**
- [ ] Input validated (FormRequest/Zod); authz enforced (policy/middleware); no secrets; no raw SQL; signed file URLs.
      **Quality**
- [ ] Tests added/updated; feature README updated; no console logs/debug; migrations additive.

## 9. Merge Rules

- No self-merge without review (except trivial docs, by agreement).
- No merging red CI. No force-push to `main`.
- Rebase your branch on `main` before merge (resolve conflicts on your side).
- Squash-merge default; delete branch after merge.

## 10. Conflict Resolution Strategy

- **Prevent** first: feature-folder ownership, small PRs, frequent rebase, contract-first stubs, additive migrations (never edit merged ones).
- When conflicts occur: the **branch author** rebases and resolves; if it touches another owner's code, resolve **together**.
- Shared files (routes provider, service providers, i18n, index barrels) are the usual hotspots — keep edits minimal and append-only where possible; coordinate before large changes.

## 11. Versioning Strategy (SemVer)

`MAJOR.MINOR.PATCH`

- **MAJOR** — breaking API/behavior change (also drives `/api/v2`).
- **MINOR** — backward-compatible feature.
- **PATCH** — backward-compatible fix.
  Derived from Conventional Commit types (feat→minor, fix→patch, `!`/BREAKING→major).

## 12. Release Process

```
1. Ensure main green; scope frozen.
2. Generate CHANGELOG from Conventional Commits.
3. Bump version; tag vX.Y.Z.
4. CI builds artifacts; deploy from tag (see Phase 12).
5. Post-release smoke check; announce in changelog.
```

## 13. Git Hygiene

- `.gitignore` covers `node_modules`, `vendor`, `.env`, build output, `storage` artifacts, IDE files.
- **Never commit secrets** — `.env.example` documents required keys.
- Pre-commit (later): lint-staged + prettier + typecheck (frontend), Pint/PHPStan (backend) — configured in Phase 3/7.

---

_This workflow is binding. It exists to protect three developers from stepping on each other while moving fast._
