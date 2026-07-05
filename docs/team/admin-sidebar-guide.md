# Admin Sidebar — Developer Guide (Manual Development)

> **Owner:** You (teammate). This area of the codebase is yours — nobody else
> will modify these files. This guide gives you everything needed to work on
> the admin panel sidebar by hand.

---

## 1. Your files (you own these)

| File                                                  | What it is                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `frontend/src/components/layout/app-sidebar.tsx`      | **The sidebar component** — brand block, nav sections, active states, collapse button                        |
| `frontend/src/components/layout/use-sidebar-store.ts` | Collapsed/expanded state (Zustand, persisted to localStorage)                                                |
| `frontend/src/constants/navigation.ts`                | **Nav registry** — the list of sections & items the sidebar renders (label, href, icon, required permission) |

### Files you'll touch _carefully_ (shared surfaces — coordinate before big changes)

| File                                           | Why it matters                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `frontend/src/components/layout/app-shell.tsx` | Wraps sidebar + topbar + content. The content offset (`lg:pl-16` / `lg:pl-60`) must match your sidebar widths |
| `frontend/src/app/globals.css`                 | Design tokens. Use the `--sidebar-*` variables — never hardcode colors                                        |

### Files you must NOT edit (other people's slices)

- `frontend/src/components/layout/topbar.tsx`, `client-shell.tsx` (client portal — different design on purpose)
- Anything under `frontend/src/features/*`
- `frontend/src/app/(dashboard)/layout.tsx` (role-branching logic)

---

## 2. How the sidebar works (read this first)

**Data flow:** `navigation.ts` (NAV_SECTIONS) → `app-sidebar.tsx` renders sections → items filtered per-user by permission → active item highlighted by current URL.

1. **Nav items** live in `frontend/src/constants/navigation.ts`:

   ```ts
   { label: "Users", href: ROUTES.users, icon: Users, permission: "users.view" }
   ```
   - `permission` — item only shows if the logged-in user has this permission slug (comes from the backend via `useAuth()`); omit to always show.
   - `icon` — any icon from `lucide-react` (import at top of the file).
   - `href` — use `ROUTES.*` from `constants/routes.ts`, never hardcode paths.

2. **Permission filtering** (in `app-sidebar.tsx`): `useAuth().hasPermission(...)` — this is UX-only; the backend enforces real access. Don't remove it.

3. **Active state**: `pathname === item.href || pathname.startsWith(item.href + "/")`.

4. **Collapse state**: `useSidebarStore()` → `{ collapsed, toggle }`. Persisted as `prossignment-sidebar` in localStorage. If you change sidebar widths (`w-16`/`w-60`), update `app-shell.tsx` paddings (`lg:pl-16`/`lg:pl-60`) to match.

5. **Collapsed mode**: labels hide, icons remain, each item gets a Tooltip. Keep that pattern for anything you add.

---

## 3. Design rules (mandatory — docs/design-system/design-system.md)

- **Colors:** ONLY the CSS tokens: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`, `text-primary`, `text-muted-foreground`, `border-sidebar-border`. No hex codes in the component. The palette is champagne gold on warm dark/light — both themes must work (toggle with the sun/moon button in the topbar).
- **Type:** brand uses `font-display` (Space Grotesk); section labels are `font-mono` uppercase tiny; items are `text-sm font-medium`.
- **Spacing:** Tailwind scale only (`px-2`, `py-2`, `gap-3`...). No arbitrary pixel values.
- **Motion:** subtle only. Current transitions: width 200ms ease-out, color transitions. Framer Motion is available if you need it (`framer-motion`), but keep it restrained.
- **Accessibility:** keep `aria-current="page"` on the active link and `aria-label` on the collapse button. Anything interactive must be keyboard-reachable.

---

## 4. Working manually — your dev loop

```bash
# 1. Get the code (first time)
git clone https://github.com/Abdul-Sattar77/Pro-Assignment-.git
cd Pro-Assignment-/frontend
npm install
copy .env.example .env.local

# 2. Run it (backend must also run — see backend/README.md, or ask)
npm run dev          # http://localhost:3000
# Log in: admin@prossignment.test / password  → sidebar visible on /dashboard

# 3. Before EVERY commit — all three must pass:
npm run lint
npm run typecheck
npm run build
```

**Git workflow (docs/git/git-workflow.md):**

```bash
git checkout main && git pull
git checkout -b feat/sidebar/<what-you-are-doing>   # e.g. feat/sidebar/hover-flyout
# ...work, commit small...
git commit -m "feat(sidebar): add hover flyout for collapsed mode"
git push -u origin feat/sidebar/<...>               # then open a Pull Request
```

- Commit messages follow **Conventional Commits** (`feat(sidebar): ...`, `fix(sidebar): ...`) — the commit hook rejects anything else.
- Never push directly to `main`; always a branch + PR.

---

## 5. Ideas / expected upcoming work

- Hover flyout submenu when collapsed (instead of tooltip) as modules grow
- Unread/notification badges on items (Notifications module will expose counts)
- "Pinned/favorites" section
- Mobile drawer version (sidebar is currently hidden `< lg`; the topbar will trigger it)
- Grouping behavior when a section's items are all permission-hidden (already handled — keep it working)

## 6. Rules of the road

1. A nav entry for each **new module** will be added to `navigation.ts` by whoever builds the module (one line, flagged in their PR) — everything else in these files is yours.
2. If lint/typecheck/build fails, the PR doesn't merge — run them locally first.
3. Questions about tokens/design → `docs/design-system/design-system.md`. Architecture → `docs/architecture/02-system-architecture.md`.
