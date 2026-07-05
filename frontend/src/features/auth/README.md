# Feature: Auth

**Owner:** Dev A · **Domain:** Identity · **Status:** ✅ Implemented (v1)

## Purpose

Authentication and session state: login, register, logout, current-user lookup,
RBAC gates, and route protection. Backend contract: `/api/v1/auth/*` (Sanctum
cookie SPA auth — csrf-cookie → login → session cookie).

## Structure

| Path                                              | Responsibility                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `components/auth-provider.tsx`                    | `AuthProvider` + `useAuth()` — app-level session context (backed by React Query) |
| `components/auth-guard.tsx`                       | `AuthGuard` — redirects unauthenticated visitors to `/login?redirect=…`          |
| `components/can.tsx`                              | `<Can permission="…" role="…">` — RBAC UI gate (UX only; backend enforces)       |
| `components/login-form.tsx` · `register-form.tsx` | Forms (RHF + Zod, 422 field mapping, loading/error states)                       |
| `hooks/use-auth-queries.ts`                       | `useCurrentUser`, `useLogin`, `useRegister`, `useLogout`                         |
| `services/auth-service.ts`                        | Typed API calls (primes CSRF cookie; unwraps `{data}` envelope)                  |
| `validation/`                                     | `loginSchema`, `registerSchema` (mirror backend FormRequests)                    |
| `utils/apply-field-errors.ts`                     | Maps 422 `details` onto RHF fields (snake_case → camelCase)                      |
| `types/`                                          | `AuthUser`, payload types (mirror `UserResource`)                                |
| `constants/`                                      | React Query keys                                                                 |
| `index.ts`                                        | **Public surface — import only from here**                                       |

## Data flow

`page → form → useLogin()/useRegister() → authService → apiClient (cookies+CSRF) → Laravel`
`AuthProvider → useCurrentUser() → GET /auth/me (deduped app-wide)`

## Consumers

- `app/(auth)/…` — login & register pages (public)
- `app/(dashboard)/layout.tsx` — wraps children in `AuthProvider` + `AuthGuard`

## Behavior notes

- Logout clears **all** cached server state except the auth key (set to null).
- `useLogin` honors `?redirect=` for deep-link return.
- New registrations receive the `client` role (backend rule).
- 401 on `/auth/me` resolves to `null` (signed-out), not an error.

## Future extensions

- Forgot/reset password pages (backend endpoints pending).
- Social login buttons (backend Socialite pending) — forms already isolated.
- Email verification flow.
