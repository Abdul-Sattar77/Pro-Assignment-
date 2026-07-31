# Prossignment — Production Deployment Guide

A practical, ordered checklist for taking Prossignment (Laravel 13 API +
Next.js 16 frontend + PostgreSQL + Laravel Reverb) from the dev machine to a
live server. Do the steps in order; each assumes the previous one succeeded.

> **Golden rule:** `php artisan serve` is a single-threaded dev server and will
> fall over under real traffic. Production **must** run PHP-FPM behind nginx (or
> Apache). Nearly every intermittent "login failed / 500 / 000" seen in
> development traces back to `artisan serve` dying — it is not a code bug.

---

## 0. Provision

| Component   | Minimum                                                         |
| ----------- | --------------------------------------------------------------- |
| Server      | 2 vCPU / 4 GB RAM Linux VPS (Ubuntu 22.04+) or managed PaaS     |
| PHP         | 8.4 with `pdo_pgsql`, `mbstring`, `bcmath`, `intl`, `zip`, `gd` |
| PostgreSQL  | 15+ (managed: Neon / Supabase / RDS, or self-hosted)            |
| Node.js     | 20+ (to build the frontend)                                     |
| Web server  | nginx + php-fpm                                                 |
| Process mgr | supervisor (or systemd) for queue worker + Reverb               |
| TLS         | Let's Encrypt / managed certificate on every public host        |

DNS records to create up front:

- `api.your-domain.com` → backend (Laravel)
- `app.your-domain.com` → frontend (Next.js)
- `ws.your-domain.com` → Reverb websocket (can be a path on the API host instead)

---

## 1. Backend — Laravel API

```bash
cd backend
cp .env.production.example .env          # then fill every <REPLACE> value
composer install --no-dev --optimize-autoloader
php artisan key:generate                 # writes APP_KEY
php artisan migrate --force              # --force required in production
php artisan db:seed --class=RolePermissionSeeder --force   # roles/permissions only
php artisan storage:link
php artisan config:cache route:cache view:cache event:cache
```

**Verify before opening traffic** (`.env` sanity):

- [ ] `APP_ENV=production` and `APP_DEBUG=false`
- [ ] `APP_KEY` is set (32-char base64)
- [ ] `APP_URL` / `FRONTEND_URL` are the real HTTPS hosts
- [ ] `SANCTUM_STATEFUL_DOMAINS` lists the frontend host
- [ ] `DB_*` point at the production database
- [ ] `MAIL_MAILER=smtp` with real credentials (not `log`)
- [ ] `BROADCAST_CONNECTION=reverb` with matching `REVERB_*`
- [ ] `SESSION_SECURE_COOKIE=true`, `SESSION_DOMAIN=.your-domain.com`

> **Auth note:** this app authenticates with a **Sanctum Bearer token stored in
> the browser (localStorage)**, sent as an `Authorization` header — it does not
> rely on session cookies for API calls. Any resource the browser loads directly
> (an `<img src>` / `<audio src>` / `<a href>` pointing at an API route) sends
> **no** token and will 401; such assets must be fetched through the app's
> authenticated client (already handled in code — keep it that way).

### nginx (backend) — sketch

```nginx
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    root /var/www/prossignment/backend/public;
    index index.php;
    client_max_body_size 105M;            # matches the 100 MB upload cap

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }
    # ssl_certificate ... ssl_certificate_key ...;
}
```

### Queue worker (recommended)

Notifications currently send synchronously and are failure-isolated (a mail
outage cannot break the action that triggered it). Run a worker so any future
queued jobs are processed and to keep the option open:

```bash
# /etc/supervisor/conf.d/prossignment-queue.conf
[program:prossignment-queue]
command=php /var/www/prossignment/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
numprocs=1
user=www-data
stopwaitsecs=3600
```

### Reverb websocket server (required for real-time chat/notifications)

```bash
# /etc/supervisor/conf.d/prossignment-reverb.conf
[program:prossignment-reverb]
command=php /var/www/prossignment/backend/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
```

Proxy `wss://ws.your-domain.com` → `127.0.0.1:8080` in nginx with TLS + the
`Upgrade`/`Connection` websocket headers.

### Scheduler (payment reminders etc.)

```cron
* * * * * cd /var/www/prossignment/backend && php artisan schedule:run >> /dev/null 2>&1
```

```bash
sudo supervisorctl reread && sudo supervisorctl update && sudo supervisorctl start all
```

---

## 2. Frontend — Next.js

```bash
cd frontend
cp .env.production.example .env.production   # fill the HTTPS + Reverb values
npm ci
npm run build                                # ~1-2 min
npm run start                                # or deploy to Vercel / Node host
```

- [ ] `NEXT_PUBLIC_API_URL` = `https://api.your-domain.com`
- [ ] `NEXT_PUBLIC_REVERB_*` mirror the backend `REVERB_*`
- [ ] `NEXT_PUBLIC_APP_CURRENCY` set (e.g. `GBP`)

If hosting on Vercel, set these in the project's Environment Variables panel
instead of a file, then redeploy.

---

## 3. Post-deploy smoke test

Run against the live hosts:

- [ ] `GET https://api.your-domain.com/up` → 200 (Laravel health check)
- [ ] Log in as each role: admin / project_manager / writer / client
- [ ] Create an assignment as a client → admin + PM receive an in-app notification
- [ ] Send a chat message → the other participant gets a notification + email
- [ ] Upload a document in Files, then play a voice note (audio streams, no 401)
- [ ] Try uploading a `.php`/`.exe` file → rejected ("not allowed for security")
- [ ] Hit the login endpoint 7× fast → 429 Too Many Requests (rate limit works)
- [ ] PM dashboard shows **their** assignment counts, admin sees org-wide
- [ ] Finance/invoices render the configured currency

---

## 4. Routine operations

```bash
# Deploy an update
git pull
cd backend  && composer install --no-dev -o && php artisan migrate --force \
            && php artisan config:cache route:cache \
            && sudo supervisorctl restart prossignment-queue prossignment-reverb
cd ../frontend && npm ci && npm run build && pm2 restart prossignment-web  # or redeploy
```

- Back up PostgreSQL daily (`pg_dump`) and store off-server.
- Rotate `storage/logs` (LOG_STACK=daily already does this).
- After any `.env` change: `php artisan config:cache` (cached config ignores raw env).

---

## 5. Known follow-ups / client actions (out of code scope)

These are environment/business items the code cannot supply — the client or
host must provide them:

- Real SMTP credentials (until then email is captured to the log, not sent).
- A registered domain + TLS certificates on all three hosts.
- Hosting that keeps the **queue worker** and **Reverb** processes alive.
- WhatsApp Business + Gmail shared-inbox credentials **if** those modules are
  used (separate, optional scopes — leave the env blank to disable).
