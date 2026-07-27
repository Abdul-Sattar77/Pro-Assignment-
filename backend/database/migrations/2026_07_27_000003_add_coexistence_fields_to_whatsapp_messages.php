<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WhatsApp Coexistence support.
 *
 * Under Coexistence the same number stays live on the WhatsApp Business phone
 * app AND the Cloud API. Messages staff send from the phone arrive as
 * `smb_message_echoes` webhooks — they are outbound, but the portal cannot
 * know WHICH staff member tapped send, because that happened outside the
 * portal entirely.
 *
 * `via_business_app` makes that distinction explicit rather than leaving an
 * outbound message with a null sender looking like a bug: admins can see at a
 * glance that a reply bypassed the portal and therefore has no rep attribution.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table): void {
            // True = sent from the WhatsApp Business phone app, not the portal.
            $table->boolean('via_business_app')->default(false)->after('is_template');

            // Staff can edit a sent message from the phone; keep the timestamp
            // so the activity log's before/after has a clock reference.
            $table->timestampTz('edited_at')->nullable()->after('via_business_app');

            $table->index('via_business_app');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table): void {
            $table->dropIndex(['via_business_app']);
            $table->dropColumn(['via_business_app', 'edited_at']);
        });
    }
};
