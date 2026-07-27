# WhatsApp Business Integration — Architecture & Setup Runbook

Connects the company's WhatsApp Business number to the portal via Meta's
**WhatsApp Business Cloud API**. Customers keep using WhatsApp exactly as
before; staff read and reply from the portal, where every message is stored,
attributed to a sales rep, and audited.

---

## 1. What this costs

| Item                                                              | Cost                       |
| ----------------------------------------------------------------- | -------------------------- |
| Cloud API access                                                  | **Free** — no monthly fee  |
| Customer-initiated service conversations (they message, we reply) | **Free of charge**         |
| Business-initiated messages (we message first)                    | Paid — requires a template |
| Marketing templates                                               | Paid, per message          |

### The 24-hour service window

Meta only accepts **free-form replies within 24 hours** of the customer's last
inbound message. That window is what makes this near-zero cost for support.

- Inside the window → plain text replies, free.
- Outside it → Meta rejects free text with error **131047**. The only delivery
  path is a pre-approved **template**, which is billable.

The portal models this explicitly:

- `whatsapp_contacts.last_inbound_at` records when the window last reset.
- `WhatsAppContact::isWithinServiceWindow()` is the single source of truth.
- The composer UI **blocks** free-form replies when the window is shut and
  requires a deliberate click on "Send paid template to reopen", so the client
  never spends money by accident.
- If the customer simply messages again, the free window reopens at no cost.

---

## 2. One-time Meta setup

> **Use Coexistence.** Meta's Coexistence flow (GA since May 2025) keeps the
> number live on the WhatsApp Business **phone app** _and_ the Cloud API at the
> same time — staff lose nothing. It must be connected through **Embedded
> Signup**, not the manual API-Setup number registration; the manual path
> deregisters the phone app. See §7.

1. **Meta Business Account** — <https://business.facebook.com>. Complete
   Business Verification (needed to raise messaging limits beyond the trial
   tier).
2. **Create an app** at <https://developers.facebook.com> → type **Business** →
   add the **WhatsApp** product.
3. **Connect the phone number.** For an existing WhatsApp Business app number,
   use **Embedded Signup → business-app onboarding (Coexistence)** so the phone
   app keeps working (§7). Only use WhatsApp → API Setup registration for a
   fresh number nobody uses on a handset. Either way, note the **Phone number
   ID** and **WhatsApp Business Account (WABA) ID**.
4. **Create a permanent token**: Business Settings → System Users → add a
   system user with the `whatsapp_business_messaging` and
   `whatsapp_business_management` permissions → Generate token → **never
   expires**. The 24-hour token on the dashboard is for smoke tests only.
5. **Copy the App Secret** from App Settings → Basic. This validates webhook
   signatures.

### Environment

```dotenv
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_ACCESS_TOKEN=...          # permanent System User token
WHATSAPP_VERIFY_TOKEN=...          # any secret you invent; also typed into Meta
WHATSAPP_APP_SECRET=...            # App Settings -> Basic
WHATSAPP_VERIFY_SIGNATURE=true
```

### Webhook

In the Meta dashboard → WhatsApp → Configuration → Webhooks:

- **Callback URL:** `https://YOUR-DOMAIN/api/v1/whatsapp/webhook`
- **Verify token:** the same string as `WHATSAPP_VERIFY_TOKEN`
- **Subscribe to fields:** `messages` (covers inbound messages _and_ delivery
  statuses). For Coexistence also subscribe to `smb_message_echoes`,
  `account_offboarded` and `account_reconnected` (§7).

Meta immediately GETs the URL and expects `hub.challenge` echoed back as plain
text — `WhatsAppWebhookController::verify()` handles that.

The URL must be **public HTTPS**. For local development, tunnel it:

```bash
ngrok http 8000     # then use the https URL Meta can reach
```

---

## 3. How it works

```
Customer's WhatsApp
        │  (message)
        ▼
   Meta Cloud API
        │  POST /api/v1/whatsapp/webhook   [X-Hub-Signature-256]
        ▼
VerifyWhatsAppSignature ── rejects forged payloads (HMAC over the raw body)
        ▼
WhatsAppWebhookProcessor ── idempotent on `wamid`; mirrors media to disk
        ▼
whatsapp_contacts / whatsapp_messages     (Postgres)
        │
        ├─► WhatsAppMessageReceived ──► Reverb ──► private-whatsapp.inbox ──► portal UI
        └─► spatie/activitylog                                  (real-time, no refresh)
```

Replies run the same path in reverse through `WhatsAppInboxService::reply()`,
which writes the message row **before** calling Meta, so a failed send still
leaves an auditable record of what a rep tried to send.

### Key files

| Layer      | File                                                     |
| ---------- | -------------------------------------------------------- |
| Config     | `config/whatsapp.php`                                    |
| API client | `app/Services/WhatsApp/WhatsAppCloudApi.php`             |
| Ingestion  | `app/Services/WhatsApp/WhatsAppWebhookProcessor.php`     |
| Domain     | `app/Services/WhatsApp/WhatsAppInboxService.php`         |
| Security   | `app/Http/Middleware/VerifyWhatsAppSignature.php`        |
| Access     | `app/Policies/WhatsAppContactPolicy.php`                 |
| Real-time  | `app/Events/WhatsAppMessage{Received,StatusUpdated}.php` |
| Frontend   | `frontend/src/features/whatsapp/`                        |
| Page       | `frontend/src/app/(dashboard)/whatsapp/page.tsx`         |

---

## 4. Roles & access

A dedicated **`sales`** role was added (`App\Enums\Role::Sales`). Permissions:

| Permission        | Admin | Sales | Meaning                                   |
| ----------------- | :---: | :---: | ----------------------------------------- |
| `whatsapp.view`   |  ✅   |  ✅   | See the inbox                             |
| `whatsapp.send`   |  ✅   |  ✅   | Reply / archive                           |
| `whatsapp.assign` |  ✅   |  ✅   | Claim or hand over a thread               |
| `whatsapp.delete` |  ✅   |  ✅   | **Hide** a message (soft — never removed) |
| `whatsapp.audit`  |  ✅   |  ❌   | See every thread + all hidden messages    |

Scoping: a rep sees threads assigned to them plus the unassigned queue. Anyone
with `whatsapp.audit` sees everything.

To grant WhatsApp access to Project Managers, add the `whatsapp.*` entries to
the `Role::ProjectManager` block in `database/seeders/RolePermissionSeeder.php`
and re-run the seeder.

---

## 5. The audit guarantees

The client's requirements map onto concrete mechanisms:

| Requirement                             | Mechanism                                                         |
| --------------------------------------- | ----------------------------------------------------------------- |
| All messages stored                     | Every inbound/outbound row in `whatsapp_messages`, incl. failures |
| Which rep sent it                       | `whatsapp_messages.sender_id`, `restrictOnDelete`                 |
| Logged with date & time                 | `created_at`, `sent_at`, `delivered_at`, `read_at`, `failed_at`   |
| Sales cannot permanently delete         | No hard-delete path exists in the service, controller or routes   |
| Deleted messages still visible to admin | `SoftDeletes` + `deleted_by`; admin queries use `withTrashed()`   |
| Delete/archive actions appear in audit  | `spatie/activitylog` on both models + explicit `activity()` logs  |
| Admin monitors all sales activity       | `GET /api/v1/whatsapp/admin/audit-log`                            |

`deleted_by` is nullable-on-user-delete but `sender_id` is `restrictOnDelete`:
attribution must survive even if a rep's account is removed.

---

## 6. Operations

**Run the real-time server** (otherwise the UI falls back to polling every
15s — still functional, just not instant):

```bash
php artisan reverb:start
```

Set `BROADCAST_CONNECTION=reverb` in `.env` (the example ships with `log`).

**Media.** Meta deletes its copy after 30 days, so inbound media is mirrored to
the private disk on arrival. If a download fails, the message row and
`media_id` survive and can be re-fetched inside that 30-day window.

**Rate limits.** New numbers start at a 250 business-initiated conversations
/24h tier and scale up with quality. Replies inside the service window are not
subject to that cap.

### Troubleshooting

| Symptom                            | Cause / fix                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| Webhook verification fails in Meta | `WHATSAPP_VERIFY_TOKEN` mismatch, or URL not publicly reachable  |
| 403 on inbound webhooks            | Wrong `WHATSAPP_APP_SECRET` — the HMAC is over the **raw** body  |
| Messages arrive but no live update | Reverb not running, or `BROADCAST_CONNECTION` still set to `log` |
| Sends fail with error 131047       | Service window closed — expected; use the template path          |
| Duplicate messages                 | Should be impossible: `wamid` is uniquely indexed                |
| Inbox silently stops receiving     | Coexistence link dropped — grep logs for `OFFBOARDED` (see §7)   |

---

## 7. Coexistence (phone app + portal on one number)

Meta's Coexistence keeps the number usable on the WhatsApp Business phone app
while the Cloud API mirrors everything into the portal. Connect it via
**Embedded Signup** with the business-app onboarding flow — the manual
API-Setup registration path does **not** support it and will deregister the
phone.

Once connected, up to 6 months of prior chat history can be imported.

### Extra webhook fields the portal handles

| Field                 | Meaning                                  | What the portal does                              |
| --------------------- | ---------------------------------------- | ------------------------------------------------- |
| `smb_message_echoes`  | Staff sent/edited/revoked from the phone | Stores as outbound with `via_business_app = true` |
| `account_offboarded`  | Coexistence link dropped                 | `Log::critical` — the inbox will go quiet         |
| `account_reconnected` | Link restored                            | `Log::info`                                       |

### Behaviours worth knowing

- **No rep attribution for phone-sent messages.** `sender_id` stays `null` and
  `via_business_app` is `true`. The portal genuinely cannot know who tapped
  send on a shared handset, and inventing a name would corrupt the audit trail.
  The UI labels these "Sent from phone app".
- **Revoke ≠ delete.** Deleting a message on the phone soft-deletes ours and
  writes an activity-log entry — the body stays readable to admins. Same
  guarantee as the portal's own hide action.
- **Business replies never reopen the free window.** Only a customer's inbound
  message resets `last_inbound_at`, so the 24-hour costing stays accurate.
- **The 14-day rule.** If nobody opens the WhatsApp Business app for ~14 days,
  Meta cuts the API link and `account_offboarded` fires. Watch for it.
