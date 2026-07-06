# PM Panel & Assignments UI — Developer Guide (Manual Development)

> For the teammate working WITHOUT Claude Code. This explains exactly which
> files make up the PM panel, how the pieces connect, and how to extend it
> (including adding the Writer-panel buttons).

---

## 1. The file map — where everything lives

**All under `frontend/src/features/assignments/`** (this folder is the module):

| File                                  | What it does                                                                 | Edit when you want to…                                     |
| ------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `components/assignments-table.tsx`    | The orders queue (search, status filter, pagination, overdue highlight)      | change queue columns, filters, row layout                  |
| `components/assignment-detail.tsx`    | The order page (header, brief, meta, timeline layout)                        | change the detail page layout                              |
| `components/assignment-actions.tsx`   | ⭐ **The action registry** — which buttons exist, their labels/icons/dialogs | add/change workflow buttons (accept/reject/submit go here) |
| `components/assign-writer-dialog.tsx` | The "Assign writer" popup (writer dropdown)                                  | change how PMs pick writers                                |
| `components/action-note-dialog.tsx`   | The generic confirm-with-note popup used by every other action               | change dialog behavior for all actions at once             |
| `components/status-badge.tsx`         | Status pill (dot + label)                                                    | change status colors/labels (edit `constants` too)         |
| `components/assignment-timeline.tsx`  | Activity history list                                                        | change timeline appearance                                 |
| `hooks/use-assignments.ts`            | Data fetching/mutations (React Query)                                        | rarely — add a new query/mutation                          |
| `services/assignments-service.ts`     | Raw API calls                                                                | rarely — new endpoint appears                              |
| `constants/index.ts`                  | `STATUS_META` (badge colors per status), query keys                          | change status colors/labels                                |
| `types/index.ts`                      | TypeScript contracts (mirror the backend)                                    | only if the backend contract changes                       |

**Route files** (thin — usually no need to touch):

- `frontend/src/app/(dashboard)/assignments/page.tsx` → `/assignments`
- `frontend/src/app/(dashboard)/assignments/[id]/page.tsx` → `/assignments/{id}`

**Do NOT edit:** anything in `features/auth`, `features/users` internals (import from their `index.ts` only), `app/(dashboard)/layout.tsx`, `client-shell.tsx`, backend files.

---

## 2. The one concept you must understand

**The backend decides who can do what.** Every order the API returns includes:

```json
"actions": ["deliver", "return", "cancel"]
```

…computed for the CURRENTLY LOGGED-IN user by the state machine. The frontend
NEVER decides permissions — `assignment-actions.tsx` just looks up each key in
`ACTION_CONFIG` and draws a button. No config → no button (never broken UI).

So: **PM logs in → sees assign/deliver/return/cancel. Writer logs in → the API
sends accept/reject/submit — buttons appear as soon as their config exists.**

---

## 3. HOW-TO: add a workflow button (worked example)

> ✅ **Update:** the writer buttons (accept/reject/submit) are now ALREADY
> implemented in `ACTION_CONFIG` — treat this section as the reference for how
> it was done, and reuse the exact same recipe for any future action.

Open `components/assignment-actions.tsx`, find `ACTION_CONFIG`, add entries
like these:

```ts
accept: {
  label: "Accept assignment",
  icon: Check,                    // import { Check } from "lucide-react"
  variant: "default",
  dialog: {
    action: "accept",
    title: "Accept this assignment?",
    description: "You commit to delivering by the deadline shown.",
    confirmLabel: "Accept",
    note: "none",                 // no note field
  },
},
reject: {
  label: "Decline",
  icon: X,
  variant: "outline",
  dialog: {
    action: "reject",
    title: "Decline this assignment?",
    description: "It returns to the manager's queue. A reason helps.",
    confirmLabel: "Decline",
    note: "optional",             // optional note textarea
  },
},
submit: {
  label: "Submit work",
  icon: Upload,
  variant: "default",
  dialog: {
    action: "submit",
    title: "Submit for review",
    description: "Your manager will review before delivery to the client.",
    confirmLabel: "Submit",
    note: "optional",
  },
},
```

That's it. Dialog, API call, cache refresh, toast, and timeline all already
work. Log in as a writer with an assigned order to see them live.

`note:` values → `"none"` (no field) · `"optional"` · `"required"` (min 10 chars).

---

## 4. Testing your changes locally

```bash
# run both servers (two terminals)
cd backend  && php artisan serve      # http://localhost:8000
cd frontend && npm run dev            # http://localhost:3000
```

**Test accounts** (local dev DB):

| Role   | Email                     | Password     |
| ------ | ------------------------- | ------------ |
| Admin  | admin@prossignment.test   | password     |
| PM     | pm@prossignment.test      | Password123! |
| Writer | writer2@prossignment.test | Password123! |
| Client | client@prossignment.test  | Password123! |

**A full manual test loop:** log in as client → (order form ships with the
client panel; meanwhile ask an admin/PM to view queue) → PM: `/assignments` →
open order → Assign writer → log in as writer → open the order → your new
Accept/Submit buttons → PM: Deliver → client: complete. Watch the timeline
grow at every step.

**Before every commit (all three must pass):**

```bash
npm run lint && npm run typecheck && npm run build
```

**Branch/commit style** (docs/git/git-workflow.md):

```bash
git checkout -b feat/assignments/writer-actions
git commit -m "feat(assignments): add writer accept/reject/submit actions"
```

---

## 5. Design rules (quick)

- Tokens only (`bg-primary`, `text-muted-foreground`…) — no hex codes.
- Reuse `components/ui/*` (Button, Dialog, Select…) — never hand-roll.
- Every list needs loading (Skeleton), empty, and error states — the queue
  shows the pattern.
- Status colors live in ONE place: `constants/index.ts` → `STATUS_META`.

## 6. Where to look things up

- Backend workflow rules: `backend/app/Services/Assignments/AssignmentService.php`
- API shapes: `backend/app/Http/Resources/AssignmentResource.php`
- This feature's overview: `frontend/src/features/assignments/README.md`
- Sidebar (also yours): `docs/team/admin-sidebar-guide.md`
