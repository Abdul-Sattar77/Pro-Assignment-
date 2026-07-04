# lib

Core infrastructure and singletons:

- `api-client.ts` — the single Axios instance (cookies, CSRF, interceptors).
- `http-error.ts` — normalized API error shape.
- `utils.ts` — `cn()` and low-level helpers.
  No React/UI here — pure infrastructure.
