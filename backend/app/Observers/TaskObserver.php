<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use App\Enums\TaskStatus;
use App\Models\CalendarEvent;
use App\Models\Task;

/**
 * Observers task writes to sync task due dates to calendar events.
 */
final class TaskObserver
{
    public function saved(Task $task): void
    {
        if ($task->due_date !== null) {
            $status = CalendarEventStatus::Upcoming;
            if ($task->status === TaskStatus::Completed) {
                $status = CalendarEventStatus::Completed;
            } elseif ($task->status === TaskStatus::Cancelled) {
                $status = CalendarEventStatus::Cancelled;
            }

            CalendarEvent::query()->updateOrCreate(
                [
                    'task_id' => $task->getKey(),
                    'event_type' => CalendarEventType::Custom->value,
                ],
                [
                    'title' => "Task Due: {$task->title}",
                    'description' => $task->description ?? "Task #{$task->getKey()} deadline.",
                    'start_date' => $task->due_date,
                    'status' => $status->value,
                    'created_by_id' => $task->created_by_id,
                    'user_id' => $task->assigned_user_id,
                    'assignment_id' => $task->assignment_id,
                ],
            );
        } else {
            CalendarEvent::query()
                ->where('task_id', $task->getKey())
                ->delete();
        }
    }

    public function deleted(Task $task): void
    {
        CalendarEvent::query()
            ->where('task_id', $task->getKey())
            ->delete();
    }

    public function restored(Task $task): void
    {
        $this->saved($task);
    }
}
