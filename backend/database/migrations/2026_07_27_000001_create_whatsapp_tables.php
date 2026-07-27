<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WhatsApp Business Cloud API inbox.
 *
 * One `whatsapp_contacts` row per customer phone number (WhatsApp itself has
 * no multi-thread concept — the number IS the thread). Every inbound and
 * outbound message is persisted in `whatsapp_messages`, including failures,
 * so the audit trail is complete regardless of delivery outcome.
 *
 * Deletion is soft everywhere: sales reps may hide a message from the inbox,
 * but the row survives with `deleted_by` recorded and stays visible to admins.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_contacts', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();

            // E.164 digits as Meta reports them (no '+'), e.g. 923001234567.
            $table->string('wa_id')->unique();
            $table->string('phone')->nullable();          // display-formatted
            $table->string('profile_name')->nullable();   // WhatsApp display name

            // Optional links into the portal's own records.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();

            // Owning sales rep. Null = unassigned, sitting in the shared queue.
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            $table->timestampTz('last_message_at')->nullable();
            // Drives the 24-hour service window: free-form replies are only
            // deliverable within `service_window_hours` of this timestamp.
            $table->timestampTz('last_inbound_at')->nullable();

            // Archiving is a view-state flag, never a delete.
            $table->boolean('is_archived')->default(false);
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('archived_at')->nullable();

            $table->timestamps();
            $table->softDeletesTz();

            $table->index('last_message_at');
            $table->index('assigned_to');
            $table->index('is_archived');
        });

        Schema::create('whatsapp_messages', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();

            // Meta's message id (wamid.*). Unique so replayed webhooks — which
            // Meta retries aggressively — cannot double-insert a message.
            $table->string('wamid')->nullable()->unique();
            $table->string('context_wamid')->nullable(); // message this replies to

            $table->string('direction');  // inbound | outbound
            $table->string('type')->default('text');
            $table->text('body')->nullable();

            // Which sales rep sent it. Null on inbound (the customer sent it)
            // and on system/automated sends. Restricted on delete so the
            // attribution can never be orphaned by removing a user.
            $table->foreignId('sender_id')->nullable()->constrained('users')->restrictOnDelete();

            // Delivery lifecycle: pending -> sent -> delivered -> read, or failed.
            $table->string('status')->default('pending');
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();

            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('delivered_at')->nullable();
            $table->timestampTz('read_at')->nullable();
            $table->timestampTz('failed_at')->nullable();

            // Paid, business-initiated template sends (outside the 24h window).
            $table->boolean('is_template')->default(false);
            $table->string('template_name')->nullable();

            // Media mirrored onto the private disk — Meta expires its own copy
            // after 30 days, which would otherwise gap the audit trail.
            $table->string('media_id')->nullable();       // Meta's media handle
            $table->string('disk')->nullable();
            $table->string('path')->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();

            // Raw webhook/API envelope, kept verbatim for dispute resolution.
            $table->jsonb('payload')->nullable();

            $table->timestamps();
            $table->softDeletesTz();
            // Who hid it. The row itself is never removed.
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['contact_id', 'id']);
            $table->index('status');
            $table->index('direction');
        });

        // Per-user read state for the shared inbox: "unread" means unread for
        // *you*, not globally, so one rep opening a thread does not clear the
        // badge for everyone else.
        Schema::create('whatsapp_contact_reads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestampTz('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['contact_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_contact_reads');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_contacts');
    }
};
