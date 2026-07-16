<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Direct (cross-role) messaging — deliberately separate from the per-assignment
 * message thread. `chat_conversations` are 1:1 (Phase 1); `chat_policies` is the
 * admin-controlled matrix of which role pairs may talk. Everything admin-gated
 * by default: only pairs containing admin or PM are enabled.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_conversations', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('type')->default('direct'); // direct | group (future)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('last_message_at')->nullable();
            $table->timestamps();

            $table->index('last_message_at');
        });

        Schema::create('chat_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chat_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestampTz('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['conversation_id', 'user_id']);
            $table->index('user_id');
        });

        Schema::create('chat_messages', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('conversation_id')->constrained('chat_conversations')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->restrictOnDelete();
            $table->string('type')->default('text'); // text | file | voice | image | video
            $table->text('body')->nullable();
            // Attachment (private disk)
            $table->string('disk')->nullable();
            $table->string('path')->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });

        Schema::create('chat_policies', function (Blueprint $table): void {
            $table->id();
            $table->string('role_a'); // canonical: role_a <= role_b (alphabetical)
            $table->string('role_b');
            $table->boolean('allowed')->default(false);
            $table->boolean('locked')->default(false); // admin/PM pairs can't be toggled off
            $table->timestamps();

            $table->unique(['role_a', 'role_b']);
        });

        $this->seedPolicies();
    }

    /** Seed the default matrix: everything admin-gated except admin/PM pairs. */
    private function seedPolicies(): void
    {
        $roles = ['admin', 'client', 'project_manager', 'writer']; // alphabetical
        $rows = [];
        $now = now();

        for ($i = 0; $i < count($roles); $i++) {
            for ($j = $i; $j < count($roles); $j++) {
                $a = $roles[$i];
                $b = $roles[$j];
                $hasAdmin = in_array('admin', [$a, $b], true);
                $hasPm = in_array('project_manager', [$a, $b], true);

                $rows[] = [
                    'role_a' => $a,
                    'role_b' => $b,
                    // Admin & PM reach everyone by default; admin pairs are
                    // locked (superuser), PM pairs stay admin-toggleable, and
                    // every other pair starts OFF for the admin to enable.
                    'allowed' => $hasAdmin || $hasPm,
                    'locked' => $hasAdmin,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('chat_policies')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_participants');
        Schema::dropIfExists('chat_policies');
        Schema::dropIfExists('chat_conversations');
    }
};
