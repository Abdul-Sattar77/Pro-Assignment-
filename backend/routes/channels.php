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
