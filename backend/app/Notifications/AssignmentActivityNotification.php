<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\AssignmentEventType;
use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * In-app notification for a workflow event on an assignment. Stored via the
 * database channel; realtime-ready (add 'broadcast' to via() when Reverb ships).
 */
final class AssignmentActivityNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Assignment $assignment,
        private readonly AssignmentEventType $event,
        private readonly string $message,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->event->value,
            'title' => $this->event->label(),
            'message' => $this->message,
            'assignmentId' => $this->assignment->uuid,
            'assignmentTitle' => $this->assignment->title,
        ];
    }
}
