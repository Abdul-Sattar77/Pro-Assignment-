# Feature: Users

**Owner:** Dev A · **Domain:** Identity · **Status:** ✅ Implemented (v1)

## Purpose

User management (admin provisioning): list with search/filter/pagination,
create with role assignment, edit (details/role/password), activate/deactivate,
and soft delete. Backend contract: `/api/v1/users` (see `backend/README.md`).

## Structure

| Path                                    | Responsibility                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `components/users-table.tsx`            | Toolbar (debounced search, role/status filters) + table + pagination + row actions |
| `components/user-form-dialog.tsx`       | Create/edit dialog (RHF + Zod, 422 mapping, role select)                           |
| `components/delete-user-dialog.tsx`     | Destructive confirmation (soft delete)                                             |
| `hooks/use-users.ts`                    | `useUsers` (list, keepPreviousData), create/update/delete mutations                |
| `services/users-service.ts`             | Typed API calls; maps filters to `filter[...]`/`per_page` params                   |
| `types/` · `validation/` · `constants/` | Contracts, Zod schemas, query keys + role options                                  |
| `index.ts`                              | **Public surface**                                                                 |

## Data flow

`page → UsersTable → useUsers(filters) → usersService.list → GET /users?search&filter[role]&filter[status]&page`

## RBAC

- Nav item + actions gated by `users.view` / `users.create` / `users.update` / `users.delete` (`<Can>`).
- Self-protection UX: activate/deactivate/delete disabled on your own row.
- Backend guards are authoritative: `CANNOT_DEACTIVATE_SELF`, `CANNOT_DELETE_SELF`, `LAST_ADMIN_PROTECTED` (409) — surfaced as toasts.

## Behavior notes

- List responses omit `permissions` (backend N+1 optimization); detail responses include it.
- Mutations invalidate the whole `['users']` key space.
- One role per user in the UI (backend supports multiple).

## Future extensions

- URL-synced filters (shareable list state).
- Column sorting UI (`sort` param already supported end-to-end).
- Bulk actions; user detail page with activity timeline.
