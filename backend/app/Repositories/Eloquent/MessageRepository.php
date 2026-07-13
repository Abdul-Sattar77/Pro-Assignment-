<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Message;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

final class MessageRepository extends BaseRepository implements MessageRepositoryInterface
{
    public function __construct(Message $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Message
    {
        return Message::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Message
    {
        return Message::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Message
    {
        return Message::query()->create($data);
    }

    public function getChronologicalFor(int $conversationId): Collection
    {
        return Message::query()
            ->where('conversation_id', $conversationId)
            ->with(['sender', 'attachment'])
            ->orderBy('id', 'asc')
            ->get();
    }
}
