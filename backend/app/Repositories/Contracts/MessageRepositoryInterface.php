<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Message;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface MessageRepositoryInterface.
 *
 * @extends BaseRepositoryInterface<Message>
 */
interface MessageRepositoryInterface extends BaseRepositoryInterface
{
    public function find(int|string $id): ?Message;

    public function findByUuid(string $uuid): ?Message;

    public function create(array $data): Message;

    /**
     * Get messages for a specific conversation sorted chronologically.
     *
     * @return Collection<int, Message>
     */
    public function getChronologicalFor(int $conversationId): Collection;
}
