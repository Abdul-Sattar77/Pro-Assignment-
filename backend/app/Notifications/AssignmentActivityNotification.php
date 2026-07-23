<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\AssignmentEventType;
use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Queued notification supporting both database in-app alerts and email channel.
 */
final class AssignmentActivityNotification extends Notification implements ShouldQueue
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Assignment Activity: ' . $this->assignment->title)
            ->greeting('Hello!')
            ->line('There is a new update on assignment "' . $this->assignment->title . '":')
            ->line($this->message)
            ->action('View Assignment', config('app.url') . '/assignments/' . $this->assignment->uuid)
            ->line('Thank you for using our platform!');
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
