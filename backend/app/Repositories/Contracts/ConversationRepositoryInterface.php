<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface ConversationRepositoryInterface.
 *
 * @extends BaseRepositoryInterface<Conversation>
 */
interface ConversationRepositoryInterface extends BaseRepositoryInterface
{
    public function find(int|string $id): ?Conversation;

    public function findByUuid(string $uuid): ?Conversation;

    public function create(array $data): Conversation;

    /**
     * Get conversations scoped strictly by roles.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Conversation>
     */
    public function getFilteredFor(User $actor, array $filters): Collection;

    /**
     * Get global count of unread messages for the actor.
     */
    public function getUnreadCountFor(User $actor): int;
}
