# config

Typed configuration and environment access (`env.ts`). All `process.env` reads go through here so config is validated and centralized. Only `NEXT_PUBLIC_*` values reach the client.
