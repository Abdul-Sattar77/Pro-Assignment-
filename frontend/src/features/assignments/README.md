# Feature: Assignments (PM + Writer panels)

**Owner:** Dev B · **Status:** ✅ PM panel + Writer actions implemented

## Purpose

The order workflow UI on top of `/api/v1/assignments`. One queue + one detail
page serve **every role** — the backend sends each viewer its allowed
`actions`, and the UI renders only those buttons.

## Structure

| Path                                                      | Responsibility                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `components/assignments-table.tsx`                        | Orders queue: search, status filter, overdue highlighting, pagination, row → detail                                   |
| `components/assignment-detail.tsx`                        | Full order view: header, action bar, brief, meta grid, activity timeline                                              |
| `components/assignment-actions.tsx`                       | **ACTION_CONFIG registry** — maps backend action keys to buttons/dialogs. Add Writer actions HERE.                    |
| `components/assign-writer-dialog.tsx`                     | PM: writer picker (active writers from Users API)                                                                     |
| `components/action-note-dialog.tsx`                       | ONE generic dialog for all note-style actions (deliver/return/cancel/complete/revision + future accept/reject/submit) |
| `components/status-badge.tsx` · `assignment-timeline.tsx` | Shared display pieces                                                                                                 |
| `hooks/use-assignments.ts`                                | `useAssignments`, `useAssignment`, `useAssignWriter`, `useAssignmentAction`, `useCreateAssignment`                    |
| `services/assignments-service.ts`                         | Typed API calls incl. generic `act(id, action, note)`                                                                 |
| `types/` · `constants/`                                   | Status/action types, STATUS_META (badge colors), query keys                                                           |

## How a button works (the whole pattern)

```
backend AssignmentResource.actions = ["deliver","return","cancel"]  (per viewer)
   → AssignmentActions maps each key through ACTION_CONFIG
   → click opens ActionNoteDialog (or AssignWriterDialog for "assign")
   → useAssignmentAction POSTs /assignments/{id}/{action}
   → cache updates, toast shows new status, timeline refreshes
```

Unknown/unconfigured actions are simply not rendered — no broken buttons.

## Role coverage (all implemented)

| Role     | Buttons (granted by backend per state)                        |
| -------- | ------------------------------------------------------------- |
| PM/Admin | Assign writer · Deliver to client · Return to writer · Cancel |
| Writer   | Accept assignment · Decline · Submit work                     |
| Client   | Approve & complete · Request revision · Cancel (pre-work)     |

Adding any future action = one `ACTION_CONFIG` entry in
`components/assignment-actions.tsx` — dialog, mutation, toasts, and timeline
are generic. Walkthrough: `docs/team/pm-panel-guide.md`.

## Routes

- `/assignments` — queue (`app/(dashboard)/assignments/page.tsx`)
- `/assignments/[id]` — detail (`.../[id]/page.tsx`)
  Sidebar entry already exists (`assignments.view` permission).
