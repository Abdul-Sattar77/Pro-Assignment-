<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Shared email inbox (Gmail / Google Workspace).
 *
 * Mirrors the WhatsApp inbox's guarantees: every message persisted, each
 * outbound one attributed to the rep who sent it, and deletion is always soft
 * so an admin can still see what a rep hid.
 *
 * Threading uses Gmail's own `thread_id` — RFC References/In-Reply-To chains
 * are stored too, but Gmail has already done the hard grouping work and its
 * answer is what users see in their own mail client.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_threads', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();

            // Gmail's thread id — the natural conversation key.
            $table->string('gmail_thread_id')->unique();
            $table->string('subject')->nullable();

            // Denormalised counterpart (the customer) for list rendering and
            // search, so the list view needs no join or subquery.
            $table->string('contact_email')->nullable();
            $table->string('contact_name')->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            // Owning sales rep. Null = unassigned, shared queue.
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            $table->unsignedInteger('message_count')->default(0);
            $table->timestampTz('last_message_at')->nullable();
            $table->timestampTz('last_inbound_at')->nullable();

            $table->boolean('is_archived')->default(false);
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('archived_at')->nullable();

            $table->timestamps();
            $table->softDeletesTz();

            $table->index('last_message_at');
            $table->index('assigned_to');
            $table->index('is_archived');
            $table->index('contact_email');
        });

        Schema::create('email_messages', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('thread_id')->constrained('email_threads')->cascadeOnDelete();

            // Gmail's own id, unique so a replayed sync cannot double-insert.
            $table->string('gmail_message_id')->nullable()->unique();
            // RFC 5322 Message-ID plus the threading chain.
            $table->string('rfc_message_id')->nullable()->index();
            $table->string('in_reply_to')->nullable();
            $table->text('references')->nullable();

            $table->string('direction'); // inbound | outbound

            $table->string('from_email')->nullable();
            $table->string('from_name')->nullable();
            // Recipient lists as JSON arrays of {email, name}.
            $table->jsonb('to')->nullable();
            $table->jsonb('cc')->nullable();
            $table->jsonb('bcc')->nullable();

            $table->string('subject')->nullable();
            $table->text('snippet')->nullable();
            $table->longText('body_text')->nullable();
            // Sanitised before storage — see EmailSyncService.
            $table->longText('body_html')->nullable();

            // Which rep sent it. Null on inbound (the customer wrote it) and on
            // mail sent directly from Gmail rather than the portal.
            $table->foreignId('sender_id')->nullable()->constrained('users')->restrictOnDelete();
            // True when the message was sent from Gmail, not the portal — no
            // rep attribution is possible in that case.
            $table->boolean('via_mail_client')->default(false);

            $table->string('status')->default('received'); // received|queued|sent|failed
            $table->text('error_message')->nullable();

            $table->boolean('is_read')->default(false);
            $table->timestampTz('sent_at')->nullable();

            // Raw Gmail payload headers kept for dispute resolution.
            $table->jsonb('payload')->nullable();

            $table->timestamps();
            $table->softDeletesTz();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['thread_id', 'id']);
            $table->index('direction');
        });

        Schema::create('email_attachments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('message_id')->constrained('email_messages')->cascadeOnDelete();

            // Gmail's attachment handle, so a file can be re-fetched if the
            // local mirror failed.
            $table->string('gmail_attachment_id')->nullable();
            $table->string('filename')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();

            $table->string('disk')->nullable();
            $table->string('path')->nullable();

            $table->timestamps();

            $table->index('message_id');
        });

        // Per-user read state for the shared inbox — "unread" means unread for
        // you, not globally.
        Schema::create('email_thread_reads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('thread_id')->constrained('email_threads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestampTz('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['thread_id', 'user_id']);
            $table->index('user_id');
        });

        // Single-row cursor for incremental Gmail sync (historyId) plus the
        // last successful run, so the scheduler can report staleness.
        Schema::create('email_sync_state', function (Blueprint $table): void {
            $table->id();
            $table->string('mailbox')->unique();
            $table->string('history_id')->nullable();
            $table->timestampTz('last_synced_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_sync_state');
        Schema::dropIfExists('email_thread_reads');
        Schema::dropIfExists('email_attachments');
        Schema::dropIfExists('email_messages');
        Schema::dropIfExists('email_threads');
    }
};
