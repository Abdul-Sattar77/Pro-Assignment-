<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\CalendarEventType;
use App\Models\CalendarEvent;
use App\Models\User;

/**
 * Authorization policies for Calendar Events.
 */
final class CalendarEventPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('calendar.view');
    }

    public function view(User $actor, CalendarEvent $event): bool
    {
        return $actor->can('calendar.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('calendar.manage');
    }

    public function update(User $actor, CalendarEvent $event): bool
    {
        // Prevent editing automatic synced events from the calendar page directly.
        // They must update the source Assignment/Task.
        if (in_array($event->event_type, [
            CalendarEventType::AssignmentDeadline,
            CalendarEventType::WriterDeadline,
            CalendarEventType::PaymentDue,
        ], true)) {
            return false;
        }

        return $actor->can('calendar.manage');
    }

    public function delete(User $actor, CalendarEvent $event): bool
    {
        if (in_array($event->event_type, [
            CalendarEventType::AssignmentDeadline,
            CalendarEventType::WriterDeadline,
            CalendarEventType::PaymentDue,
        ], true)) {
            return false;
        }

        return $actor->can('calendar.manage');
    }
}
