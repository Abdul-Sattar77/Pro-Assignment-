# Shared Email Inbox — Architecture & Setup Runbook

Connects a Google Workspace mailbox (e.g. `info@yourcompany.com`) to the
portal. Customers keep emailing that address as normal; staff read and reply
from the portal, where every message is stored, attributed to a rep, and
audited.

Deliberately mirrors the WhatsApp integration
([whatsapp-integration.md](whatsapp-integration.md)) — same role model, same
soft-delete guarantees, same admin oversight.

---

## 1. Authentication — read this first

**Google permanently disabled Basic Auth and App Passwords for Workspace
IMAP/POP/SMTP in May 2025.** A username + password (or app password) will not
connect. OAuth is the only route in, which is why this integration uses the
**Gmail API** rather than IMAP.

Two modes are supported — pick one in `GMAIL_AUTH_MODE`:

| Mode              | When to use                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `service_account` | **Preferred.** A Workspace admin grants domain-wide delegation once. No user consent, no token to refresh, survives staff changes. |
| `refresh_token`   | Use when you cannot get admin cooperation. The mailbox owner consents once in a browser.                                           |

### Service account setup (preferred)

1. **Google Cloud Console** → create (or pick) a project → **Enable the Gmail
   API**.
2. **IAM & Admin → Service Accounts** → create one → **Keys → Add key → JSON**.
   Download it. Note the **Client ID** shown on the service account.
3. **Google Workspace Admin** → Security → Access and data control → **API
   controls → Domain-wide delegation → Add new**:
   - **Client ID:** the service account's client ID
   - **OAuth scopes:** `https://www.googleapis.com/auth/gmail.modify`
4. Point the app at the key:

```dotenv
GMAIL_AUTH_MODE=service_account
GMAIL_MAILBOX=info@yourcompany.com
GMAIL_CREDENTIALS_PATH=/secure/path/service-account.json
# ...or inline, keeping the \n escapes:
# GMAIL_CLIENT_EMAIL=svc@project.iam.gserviceaccount.com
# GMAIL_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Refresh token setup (fallback)

1. Google Cloud Console → **OAuth consent screen** (Internal for Workspace) →
   **Credentials → OAuth client ID → Desktop app**.
2. Run the consent flow once with scope `gmail.modify` and `access_type=offline`
   to obtain a refresh token.

```dotenv
GMAIL_AUTH_MODE=refresh_token
GMAIL_MAILBOX=info@yourcompany.com
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```

Verify either mode with:

```bash
php artisan email:sync --max=5
```

---

## 2. How it works

```
Customer's email client
        │
        ▼
  Google Workspace mailbox
        │  polled every minute:  php artisan email:sync
        ▼
GoogleTokenProvider ── OAuth (signed JWT, or refresh token)
        ▼
GmailClient ──────── Gmail REST API
        ▼
EmailSyncService ─── idempotent on gmail_message_id; mirrors attachments
        ▼
email_threads / email_messages / email_attachments   (Postgres)
        │
        ├─► EmailMessageReceived ──► Reverb ──► private-email.inbox ──► portal UI
        └─► spatie/activitylog
```

Replies go out through `EmailInboxService::reply()`, which writes the row
**before** calling Gmail — so a send that fails still leaves an auditable
record of what a rep tried to send — and sets `In-Reply-To` / `References` so
the customer's mail client threads it correctly instead of starting a new
conversation.

### Scheduling

The sync is registered in `routes/console.php`. It needs the Laravel scheduler
running:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

`withoutOverlapping` is set, so a slow run cannot stack a second sync on top.

### Key files

| Layer      | File                                          |
| ---------- | --------------------------------------------- |
| Config     | `config/gmail.php`                            |
| OAuth      | `app/Services/Email/GoogleTokenProvider.php`  |
| API client | `app/Services/Email/GmailClient.php`          |
| Ingestion  | `app/Services/Email/EmailSyncService.php`     |
| Domain     | `app/Services/Email/EmailInboxService.php`    |
| Command    | `app/Console/Commands/SyncEmailCommand.php`   |
| Access     | `app/Policies/EmailThreadPolicy.php`          |
| Frontend   | `frontend/src/features/email/`                |
| Page       | `frontend/src/app/(dashboard)/email/page.tsx` |

---

## 3. Roles & access

Reuses the `sales` role added for WhatsApp.

| Permission     | Admin | Sales | Meaning                                   |
| -------------- | :---: | :---: | ----------------------------------------- |
| `email.view`   |  ✅   |  ✅   | See the inbox                             |
| `email.send`   |  ✅   |  ✅   | Reply / archive                           |
| `email.assign` |  ✅   |  ✅   | Claim or hand over a thread               |
| `email.delete` |  ✅   |  ✅   | **Hide** a message (soft — never removed) |
| `email.audit`  |  ✅   |  ❌   | Every thread + all hidden messages        |

A rep sees threads assigned to them plus the unassigned queue. Anyone with
`email.audit` sees everything.

---

## 4. Audit guarantees

| Requirement                         | Mechanism                                                        |
| ----------------------------------- | ---------------------------------------------------------------- |
| All mail stored                     | Every inbound/outbound row in `email_messages`, incl. failures   |
| Which rep replied                   | `email_messages.sender_id`, `restrictOnDelete`                   |
| Logged with date & time             | `created_at`, `sent_at`, `deleted_at`                            |
| Sales cannot permanently delete     | No hard-delete path in the service, controller or routes         |
| Deleted mail still visible to admin | `SoftDeletes` + `deleted_by`; admin queries use `withTrashed()`  |
| Actions appear in the audit log     | `spatie/activitylog` on both models + explicit `activity()` logs |
| Admin monitors all sales activity   | `GET /api/v1/email/admin/audit-log`                              |

**Attribution honesty.** Mail sent from Gmail directly (not the portal) is
stored with `sender_id = null` and `via_mail_client = true`, and the UI says
"Sent directly from Gmail — no portal user recorded". The portal cannot know
who used the shared mailbox outside it, and inventing a name would corrupt the
audit trail. This mirrors the WhatsApp Coexistence behaviour.

**Attachments** are mirrored to the private disk on arrival, so a rep deleting
mail inside Gmail cannot erase portal evidence.

---

## 5. Security notes

- **HTML email is rendered in a sandboxed iframe** (`sandbox=""` — no scripts,
  no forms, no same-origin). `EmailSyncService::sanitizeHtml()` additionally
  strips `<script>`/`<style>`/`<iframe>`, inline `on*=` handlers and
  `javascript:` URLs before storage. The iframe is the control that actually
  contains hostile markup; the stripping is defence in depth.
- **Scope is `gmail.modify`**, not full mail access — enough to read, send and
  clear the UNREAD label, and materially easier to get through Google review.
- The private key never leaves the server; no key material reaches the browser.

---

## 6. Troubleshooting

| Symptom                                | Cause / fix                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `Gmail is not configured`              | `GMAIL_MAILBOX` or the mode's credentials are unset                         |
| `unauthorized_client` on token request | Domain-wide delegation missing, or the scope there does not match exactly   |
| `Precondition check failed` (400)      | The Gmail API is not enabled on the Cloud project                           |
| Auth works but no mail appears         | `GMAIL_SYNC_QUERY` is filtering it out, or `GMAIL_BACKFILL_DAYS` is too low |
| Inbox stops updating                   | The scheduler cron is not running — check `email_sync_state.last_synced_at` |
| Mail arrives but no live update        | Reverb not running, or `BROADCAST_CONNECTION` still `log`                   |
| Duplicate emails                       | Should be impossible: `gmail_message_id` is uniquely indexed                |

The inbox header surfaces the last sync time and the last error, so a silent
failure does not masquerade as "no new mail today".
