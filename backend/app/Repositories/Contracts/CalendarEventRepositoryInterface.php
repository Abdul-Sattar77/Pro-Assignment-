<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Data-access contract for Calendar Events.
 */
interface CalendarEventRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?CalendarEvent;

    public function findByUuid(string $uuid): ?CalendarEvent;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): CalendarEvent;

    /**
     * Retrieve calendar events based on search filters, with strict role-based visibility restrictions.
     *
     * @param  array{month?: string|null, date?: string|null, start_date?: string|null, end_date?: string|null, event_type?: string|null, assignment_id?: int|null, user_id?: int|null, status?: string|null}  $filters
     * @return Collection<int, CalendarEvent>
     */
    public function getFilteredFor(User $actor, array $filters): Collection;
}
