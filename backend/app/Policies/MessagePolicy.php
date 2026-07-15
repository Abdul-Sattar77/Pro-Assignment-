<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

final class MessagePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value)
            || $actor->hasRole(Role::ProjectManager->value)
            || $actor->hasRole(Role::Writer->value)
            || $actor->hasRole(Role::Client->value);
    }

    public function view(User $actor, Conversation $conversation): bool
    {
        if ($actor->hasRole(Role::Admin->value)) {
            return true;
        }

        $assignment = $conversation->assignment;
        if ($assignment === null) {
            return false;
        }

        if ($actor->hasRole(Role::ProjectManager->value)) {
            return $assignment->project_manager_id === $actor->getKey();
        }

        if ($actor->hasRole(Role::Writer->value)) {
            return $conversation->type === 'writer'
                && $assignment->writer_id === $actor->getKey();
        }

        if ($actor->hasRole(Role::Client->value)) {
            return $conversation->type === 'client'
                && $assignment->client_id === $actor->getKey();
        }

        return false;
    }

    public function create(User $actor, Conversation $conversation): bool
    {
        return $this->view($actor, $conversation);
    }

    public function delete(User $actor, Message $message): bool
    {
        if ($actor->hasRole(Role::Admin->value)) {
            return true;
        }

        // Only the sender can delete their own message
        if ($message->sender_id === $actor->getKey()) {
            return true;
        }

        // Project Manager can delete messages in their managed assignments
        $conversation = $message->conversation;
        if ($conversation !== null) {
            $assignment = $conversation->assignment;
            if ($assignment !== null
                && $actor->hasRole(Role::ProjectManager->value)
                && $assignment->project_manager_id === $actor->getKey()
            ) {
                return true;
            }
        }

        return false;
    }
}
