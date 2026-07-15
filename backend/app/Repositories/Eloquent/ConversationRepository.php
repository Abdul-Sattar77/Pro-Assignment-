<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\Role;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class ConversationRepository extends BaseRepository implements ConversationRepositoryInterface
{
    public function __construct(Conversation $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Conversation
    {
        return Conversation::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Conversation
    {
        return Conversation::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Conversation
    {
        return Conversation::query()->create($data);
    }

    public function getFilteredFor(User $actor, array $filters): Collection
    {
        $query = Conversation::query()
            ->with(['assignment', 'creator', 'latestMessage.sender']);

        // ---- RBAC Access Scoping ----
        $isAdmin = $actor->hasRole(Role::Admin->value);

        if (!$isAdmin) {
            if ($actor->hasRole(Role::ProjectManager->value)) {
                $query->whereHas('assignment', function ($aq) use ($actor): void {
                    $aq->where('project_manager_id', $actor->getKey());
                });
            } elseif ($actor->hasRole(Role::Writer->value)) {
                $query->where('type', 'writer')
                    ->whereHas('assignment', function ($aq) use ($actor): void {
                        $aq->where('writer_id', $actor->getKey());
                    });
            } elseif ($actor->hasRole(Role::Client->value)) {
                $query->where('type', 'client')
                    ->whereHas('assignment', function ($aq) use ($actor): void {
                        $aq->where('client_id', $actor->getKey());
                    });
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        // Filter by specific Assignment (UUID or internal ID)
        $assignmentId = $filters['assignment_id'] ?? null;
        if ($assignmentId !== null) {
            $query->where('assignment_id', $assignmentId);
        }

        // Filter by chat type (client or writer)
        $type = $filters['type'] ?? null;
        if (is_string($type) && $type !== '') {
            $query->where('type', $type);
        }

        // Search within linked assignments or latest messages
        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->whereHas('assignment', function ($aq) use ($search): void {
                    $aq->where('title', 'ilike', '%' . $search . '%')
                      ->orWhere('subject', 'ilike', '%' . $search . '%');
                })->orWhereHas('messages', function ($mq) use ($search): void {
                    $mq->where('message', 'ilike', '%' . $search . '%');
                });
            });
        }

        // Sort by latest message date or conversation creation date
        return $query->get()->sortByDesc(function (Conversation $c) {
            return $c->latestMessage?->created_at?->timestamp ?? $c->created_at?->timestamp ?? 0;
        })->values();
    }

    public function getUnreadCountFor(User $actor): int
    {
        // Get all conversations this user has access to
        $conversations = $this->getFilteredFor($actor, []);

        if ($conversations->isEmpty()) {
            return 0;
        }

        $conversationIds = $conversations->pluck('id')->toArray();

        // Calculate unread count using the read receipt tracker
        return DB::table('messages')
            ->whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $actor->getKey())
            ->where('is_deleted', false)
            ->where(function ($query) use ($actor): void {
                $query->whereNotExists(function ($subQuery) use ($actor): void {
                    $subQuery->select(DB::raw(1))
                        ->from('conversation_participants')
                        ->whereColumn('conversation_participants.conversation_id', 'messages.conversation_id')
                        ->where('conversation_participants.user_id', $actor->getKey())
                        ->whereNotNull('conversation_participants.last_read_at')
                        ->whereColumn('conversation_participants.last_read_at', '>=', 'messages.created_at');
                });
            })
            ->count();
    }
}
