<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\AssignmentStatus;
use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use App\Models\Assignment;
use App\Models\CalendarEvent;

/**
 * Observers assignment writes to keep calendar events synchronized.
 */
final class AssignmentObserver
{
    public function saved(Assignment $assignment): void
    {
        $status = CalendarEventStatus::Upcoming;
        if ($assignment->status === AssignmentStatus::Completed) {
            $status = CalendarEventStatus::Completed;
        } elseif ($assignment->status === AssignmentStatus::Cancelled) {
            $status = CalendarEventStatus::Cancelled;
        }

        $creatorId = $assignment->project_manager_id ?? $assignment->client_id;

        // 1. Sync Assignment Deadline
        CalendarEvent::query()->updateOrCreate(
            [
                'assignment_id' => $assignment->getKey(),
                'event_type' => CalendarEventType::AssignmentDeadline->value,
            ],
            [
                'title' => "Assignment Deadline: {$assignment->title}",
                'description' => "Order #{$assignment->getKey()} deadline for subject {$assignment->subject}.",
                'start_date' => $assignment->deadline,
                'status' => $status->value,
                'created_by_id' => $creatorId,
                'user_id' => $assignment->client_id,
            ]
        );

        // 2. Sync Payment Due
        CalendarEvent::query()->updateOrCreate(
            [
                'assignment_id' => $assignment->getKey(),
                'event_type' => CalendarEventType::PaymentDue->value,
            ],
            [
                'title' => "Payment Due: {$assignment->title}",
                'description' => "Client payment due date for order #{$assignment->getKey()}.",
                'start_date' => $assignment->deadline,
                'status' => $status->value,
                'created_by_id' => $creatorId,
                'user_id' => $assignment->client_id,
            ]
        );

        // 3. Sync Writer Deadline
        if ($assignment->writer_id !== null) {
            CalendarEvent::query()->updateOrCreate(
                [
                    'assignment_id' => $assignment->getKey(),
                    'event_type' => CalendarEventType::WriterDeadline->value,
                ],
                [
                    'title' => "Writer Deadline: {$assignment->title}",
                    'description' => "Writer submission deadline for order #{$assignment->getKey()}.",
                    'start_date' => $assignment->deadline,
                    'status' => $status->value,
                    'created_by_id' => $creatorId,
                    'user_id' => $assignment->writer_id,
                ]
            );
        } else {
            CalendarEvent::query()
                ->where('assignment_id', $assignment->getKey())
                ->where('event_type', CalendarEventType::WriterDeadline->value)
                ->delete();
        }
    }

    public function deleted(Assignment $assignment): void
    {
        CalendarEvent::query()
            ->where('assignment_id', $assignment->getKey())
            ->delete();
    }

    public function restored(Assignment $assignment): void
    {
        $this->saved($assignment);
    }
}
