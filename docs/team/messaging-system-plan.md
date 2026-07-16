# Messaging System — Technical Plan (for approval)

Status: **PLAN FINALIZED — awaiting final go-ahead to build Phase 1.**

Decisions locked:

- Delivery: **polling** first; Reverb (WebSockets) in Phase 2.
- Camera: **capture & send** photos / short videos (no live calls in P1/P2).
- Permission matrix: **everything admin-gated** — only `admin↔all` and `pm↔all`
  are ON by default; **every other pair starts OFF** (incl. writer↔admin,
  writer↔pm, writer↔client, client↔admin, client↔pm) until admin enables it.
- Floating widget: shown to **all roles, including clients** (landing shell).
- Chat attachment cap: **50 MB** per file.
- **1:1 only** in Phase 1 (schema still supports groups later).

## 1. Goal

A cross-role direct messaging platform across all four portals (admin / PM /
writer / client) with:

- **Admin-controlled permission matrix** — admin decides who can talk to whom.
  Defaults: admin ↔ everyone, PM ↔ everyone, writer ↔ admin + PM, writer ↔
  client **only if admin allows**, client ↔ admin + PM.
- **Admin oversight** — admin can read every conversation (read-only).
- **Attachments** — files (any type, already supported), **voice notes**, and
  **camera photos / short videos**.
- **Floating chat widget** — a launcher (bottom-right, the "red circle") on
  every page, for every role.
- Real-time delivery is **polling** in Phase 1 (upgrade to WebSockets later).

Existing per-assignment chat (Conversation/Message tied to an assignment) stays
as-is; this adds a **separate direct-message layer** so we don't break the
teammate's admin inbox.

## 2. Data model (new / changed)

### `conversations` (extend existing)

- Add `type` values: `direct` (new) alongside existing assignment channels.
- Add `last_message_at` (timestamp, for sorting).
- `assignment_id` becomes **nullable** (direct chats have no assignment).

### `conversation_participants` (new pivot)

- `conversation_id`, `user_id`, `last_read_at` (unread counts), timestamps.
- 1:1 in Phase 1 (two participants); table shape already supports future groups.

### `messages` (extend existing)

- Add `conversation_id` (nullable FK — direct messages live on a conversation).
- Make `assignment_id` **nullable**.
- Add `type`: `text | file | voice | image | video`.
- `body` becomes **nullable** (media-only messages).
- Add attachment columns: `disk`, `path`, `original_name`, `mime_type`, `size`.

### `chat_policies` (new — the admin matrix)

- Row per **unordered role pair**: `role_a`, `role_b`, `allowed` (bool),
  `locked` (bool — admin/PM pairs are always-on and can't be switched off).
- Seeded defaults (**everything admin-gated**):
  | Pair                                                                           | Default | Locked             |
  | ------------------------------------------------------------------------------ | ------- | ------------------ |
  | admin ↔ anyone                                                                 | allowed | yes                |
  | pm ↔ anyone                                                                    | allowed | yes                |
  | writer ↔ pm                                                                    | **off** | no (admin toggles) |
  | writer ↔ client                                                                | **off** | no                 |
  | client ↔ pm                                                                    | **off** | no                 |
  | writer ↔ writer                                                                | **off** | no                 |
  | client ↔ client                                                                | **off** | no                 |
  | Every non-admin/PM pair starts OFF; admin switches on what each project needs. |
- (Optional later) per-user exceptions, e.g. auto-allow the writer + client who
  share an assignment. Not in Phase 1.

## 3. Backend (REST, polling-friendly)

Namespace `Api\V1\Chat`. Service holds the policy + conversation logic.

- `GET  /chat/contacts` — users the current user may message (policy-filtered).
- `GET  /chat/conversations` — my threads (last message + unread count).
- `POST /chat/conversations` — start/get a 1:1 with `{ userId }` (policy check).
- `GET  /chat/conversations/{id}/messages` — paginated (participant or admin).
- `POST /chat/conversations/{id}/messages` — send text OR attachment
  (multipart: `type`, `body?`, `file?`). Voice/photo/video are just files.
- `POST /chat/conversations/{id}/read` — mark read (unread badges).
- **Admin oversight**: `GET /admin/chat/conversations`, `.../{id}/messages`.
- **Admin matrix**: `GET /admin/chat/policies`, `PUT /admin/chat/policies`.

Authorization: a `ChatPolicy` + `ChatService::canMessage(a, b)` gate every
send / conversation-create. Admin bypasses for read (oversight) but cannot
impersonate-send.

Attachments reuse the existing private-disk storage + authorized download
route. Chat attachment cap: **25 MB** (kept lower than the 100 MB brief-file
cap; voice/photo/video clips are small). Adjustable.

## 4. Frontend

Shared `features/chat` module, used in all portals:

- **Conversation list** — threads + unread badges + "New chat" picker (contacts
  from `/chat/contacts`).
- **Chat window** — bubbles, timestamps, read state; renders attachments:
  image preview, `<audio>` player for voice, `<video>` for clips, file card for
  the rest.
- **Composer** — text input, file attach (any type), **voice record**
  (`MediaRecorder` → webm/opus), **camera capture** (`getUserMedia` → photo or
  short video → sent as attachment). Permission prompts handled gracefully.
- **Floating widget** — a launcher button fixed bottom-right on every page (both
  the client landing-style shell and the admin shell). Opens a compact panel
  (list + active chat). Visible to all roles.
- **Admin**: a **permission-matrix screen** (toggle the grid) under
  Administration, and an **oversight** view (read any conversation).
- **Polling** via React Query `refetchInterval` (~3 s active thread, ~10 s
  list). Swappable for Reverb in Phase 2 with no UI change.

## 5. Phases

- **Phase 1 (this build):** data model + migrations, chat endpoints, policy
  matrix (API + admin UI), contacts, chat UI in all portals, floating widget,
  file + voice + photo/video, admin oversight, polling. _(Large.)_
- **Phase 2:** real-time via **Laravel Reverb** (free, self-hosted) — instant
  delivery, typing indicators, presence, unread push. Replaces polling.
- **Phase 3 (optional):** live video/voice **calls** (WebRTC) — the only part
  that can incur cost (TURN relay at scale).

## 6. Cost

Phases 1–2 are **100% free** to build and run self-hosted (Laravel + Postgres +
local disk + Reverb; browser APIs for voice/camera). Only Phase 3 live _calls_
can incur a TURN-server cost at scale.

## 7. Risks / coordination

- The per-assignment Conversation/Message models are the teammate's (admin
  inbox). This plan **extends** those tables (nullable columns + new pivot) —
  the migration must land cleanly on top of their schema. **Coordinate the
  migration order** with your teammate so we don't collide mid-merge.
- Camera/mic need **HTTPS or localhost** (browser requirement) — fine for local
  dev; production needs TLS.
- Effort: Phase 1 is a few focused sessions, not one shot.

## 8. Open questions for you

1. **Default matrix** above OK? Anything to change (e.g. should clients be able
   to DM writers by default, or always admin-gated)?
2. **Floating widget for clients too?** Clients use the landing-style shell — OK
   to show the chat launcher there as well?
3. **Chat attachment size cap** — 25 MB per file good, or higher?
4. **Group chats** ever needed, or strictly 1:1? (Plan supports groups later
   either way.)
