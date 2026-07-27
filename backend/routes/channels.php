<?php

declare(strict_types=1);

use App\Models\ChatConversation;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Support\Facades\Broadcast;

/** Only conversation participants may subscribe to its private channel. */
Broadcast::channel(
    'chat.conversation.{conversation}',
    function (User $user, string $conversation): bool {
        $conv = ChatConversation::query()->where('uuid', $conversation)->first();

        return $conv !== null
            && app(ChatService::class)->isParticipant($user, $conv);
    },
);

/**
 * The WhatsApp inbox is a shared team queue, so it broadcasts on one channel
 * rather than per-thread: every authorised rep needs the conversation list to
 * reorder live, including for threads they have not opened. Per-thread access
 * is still enforced on the REST side by WhatsAppContactPolicy.
 */
Broadcast::channel(
    'whatsapp.inbox',
    fn (User $user): bool => $user->can('whatsapp.view'),
);

/** A user's personal call-signaling channel — only they may subscribe. */
Broadcast::channel(
    'calls.{userUuid}',
    fn (User $user, string $userUuid): bool => $user->uuid === $userUuid,
);
