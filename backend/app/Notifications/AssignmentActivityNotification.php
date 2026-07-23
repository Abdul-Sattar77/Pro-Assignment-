<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\AssignmentEventType;
use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification for a workflow event on an assignment. Delivered in-app (database
 * channel) AND by email, so recipients are alerted even when they're away.
 * Sent synchronously (no queue worker required); for real delivery configure
 * SMTP via MAIL_* env (MAIL_MAILER=log captures them to storage/logs in dev).
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.frontend_url'), '/')
            .'/assignments/'.$this->assignment->uuid;

        return (new MailMessage)
            ->subject($this->event->label().' · '.$this->assignment->title)
            ->line($this->message)
            ->action('View assignment', $url)
            ->line('You can manage this from your Prossignment dashboard.');
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
