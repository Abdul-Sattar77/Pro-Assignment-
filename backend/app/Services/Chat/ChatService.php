<?php

declare(strict_types=1);

namespace App\Services\Chat;

use App\Enums\ChatMessageType;
use App\Enums\Role;
use App\Events\ChatMessageSent;
use App\Exceptions\DomainRuleException;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatPolicy;
use App\Models\User;
use App\Notifications\NewChatMessageNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Direct (cross-role) messaging. Owns the admin permission matrix, conversation
 * lifecycle, and message sending. Every conversation-create / send is gated by
 * canMessage(); admins may READ any conversation (oversight) but not send as
 * someone else.
 */
final class ChatService
{
    private const ROLES = [
        Role::Admin->value,
        Role::ProjectManager->value,
        Role::Writer->value,
        Role::Client->value,
    ];

    /** A user's primary role slug (admin/project_manager/writer/client). */
    public function primaryRole(User $user): ?string
    {
        foreach (self::ROLES as $role) {
            if ($user->hasRole($role)) {
                return $role;
            }
        }

        return null;
    }

    public function isAdmin(User $user): bool
    {
        return $user->hasRole(Role::Admin->value);
    }

    /** May these two users message each other (per the matrix)? */
    public function canMessage(User $a, User $b): bool
    {
        if ($a->getKey() === $b->getKey()) {
            return false;
        }
        $ra = $this->primaryRole($a);
        $rb = $this->primaryRole($b);
        if ($ra === null || $rb === null) {
            return false;
        }

        $pair = [$ra, $rb];
        sort($pair);

        $policy = ChatPolicy::query()
            ->where('role_a', $pair[0])
            ->where('role_b', $pair[1])
            ->first();

        if ($policy === null) {
            return false;
        }

        return $policy->allowed;
    }

    /**
     * Users the given user is allowed to start a conversation with.
     *
     * @return Collection<int, User>
     */
    public function contactsFor(User $user): Collection
    {
        $role = $this->primaryRole($user);
        if ($role === null) {
            return new Collection;
        }

        $allowedRoles = [];
        foreach (self::ROLES as $other) {
            $pair = [$role, $other];
            sort($pair);
            $policy = ChatPolicy::query()
                ->where('role_a', $pair[0])
                ->where('role_b', $pair[1])
                ->first();
            if ($policy?->allowed) {
                $allowedRoles[] = $other;
            }
        }

        if ($allowedRoles === []) {
            return new Collection;
        }

        /** @var Collection<int, User> $users */
        $users = User::query()
            ->where('is_active', true)
            ->where('id', '!=', $user->getKey())
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $allowedRoles))
            ->orderBy('name')
            ->get();

        return $users;
    }

    /** Find the existing 1:1 conversation between two users, or create it. */
    public function getOrCreateDirect(User $a, User $b): ChatConversation
    {
        if (!$this->canMessage($a, $b)) {
            throw new DomainRuleException('You are not allowed to message this person.', 'CHAT_NOT_ALLOWED', 403);
        }

        $existing = ChatConversation::query()
            ->where('type', 'direct')
            ->whereHas('participants', fn ($q) => $q->where('users.id', $a->getKey()))
            ->whereHas('participants', fn ($q) => $q->where('users.id', $b->getKey()))
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return DB::transaction(function () use ($a, $b): ChatConversation {
            $conversation = ChatConversation::query()->create([
                'type' => 'direct',
                'created_by' => $a->getKey(),
            ]);
            $conversation->participants()->attach([$a->getKey(), $b->getKey()]);

            return $conversation;
        });
    }

    public function isParticipant(User $user, ChatConversation $conversation): bool
    {
        return $conversation->participants()->where('users.id', $user->getKey())->exists();
    }

    /** Send a text and/or single attachment. */
    public function send(
        User $sender,
        ChatConversation $conversation,
        ?string $body,
        ?UploadedFile $file,
    ): ChatMessage {
        if (!$this->isParticipant($sender, $conversation)) {
            throw new DomainRuleException('You are not part of this conversation.', 'CHAT_NOT_PARTICIPANT', 403);
        }

        return DB::transaction(function () use ($sender, $conversation, $body, $file): ChatMessage {
            $attributes = [
                'sender_id' => $sender->getKey(),
                'type' => ChatMessageType::Text->value,
                'body' => $body,
            ];

            if ($file !== null) {
                $type = ChatMessageType::fromMime($file->getMimeType());
                $path = $file->store("chat/{$conversation->getKey()}", 'local');

                $attributes = [
                    ...$attributes,
                    'type' => $type->value,
                    'disk' => 'local',
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }

            /** @var ChatMessage $message */
            $message = $conversation->messages()->create($attributes);

            $conversation->forceFill(['last_message_at' => $message->created_at])->save();

            // Sender has "read" up to their own message.
            $conversation->participants()->updateExistingPivot($sender->getKey(), [
                'last_read_at' => now(),
            ]);

            $message->setRelation('sender', $sender);
            $message->setRelation('conversation', $conversation);

            // Real-time: push to the other participant(s). Never let a
            // broadcast failure (e.g. Reverb server down) break sending —
            // polling is the fallback.
            try {
                broadcast(new ChatMessageSent($message))->toOthers();
            } catch (\Throwable $e) {
                report($e);
            }

            // In-app + email alert to the other participant(s) so they're
            // reached even when offline (broadcast only hits open sockets).
            // Isolated like the broadcast above — a mail/SMTP failure must not
            // roll back the message we just committed.
            try {
                $conversation->participants()
                    ->where('users.id', '!=', $sender->getKey())
                    ->get()
                    ->each(fn (User $recipient) => $recipient->notify(
                        new NewChatMessageNotification($message),
                    ));
            } catch (\Throwable $e) {
                report($e);
            }

            return $message;
        });
    }

    public function markRead(User $user, ChatConversation $conversation): void
    {
        $conversation->participants()->updateExistingPivot($user->getKey(), [
            'last_read_at' => now(),
        ]);
    }

    /** Unread messages for a user in a conversation (not their own, after last_read_at). */
    public function unreadCount(User $user, ChatConversation $conversation): int
    {
        $participant = $conversation->participants()
            ->where('users.id', $user->getKey())
            ->first();
        $lastRead = $participant?->pivot?->getAttribute('last_read_at');

        $query = $conversation->messages()->where('sender_id', '!=', $user->getKey());

        if ($lastRead !== null) {
            $query->where('created_at', '>', $lastRead);
        }

        return $query->count();
    }

    // ---- Admin: permission matrix ----

    /** @return Collection<int, ChatPolicy> */
    public function policies(): Collection
    {
        /** @var Collection<int, ChatPolicy> $rows */
        $rows = ChatPolicy::query()->orderBy('role_a')->orderBy('role_b')->get();

        return $rows;
    }

    /**
     * Update matrix rows. Locked pairs are never changed.
     *
     * @param  array<int, array{role_a: string, role_b: string, allowed: bool}>  $updates
     */
    public function updatePolicies(array $updates): void
    {
        DB::transaction(function () use ($updates): void {
            foreach ($updates as $row) {
                $pair = [$row['role_a'], $row['role_b']];
                sort($pair);

                ChatPolicy::query()
                    ->where('role_a', $pair[0])
                    ->where('role_b', $pair[1])
                    ->where('locked', false)
                    ->update(['allowed' => $row['allowed']]);
            }
        });
    }
}
