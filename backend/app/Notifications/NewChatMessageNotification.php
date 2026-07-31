<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ChatMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Fires when a chat message lands, so recipients get an in-app entry (database)
 * plus an email even while offline. Email uses the configured mailer; with
 * MAIL_MAILER=log it is captured to the log until SMTP is set for production.
 */
final class NewChatMessageNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly ChatMessage $message) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'messageId' => $this->message->uuid,
            'conversationId' => $this->message->conversation?->uuid,
            'senderName' => $this->message->sender?->name ?? 'Someone',
            'snippet' => $this->snippet(),
            'type' => 'new_chat_message',
            'createdAt' => $this->message->created_at?->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $sender = $this->message->sender?->name ?? 'Someone';

        return (new MailMessage)
            ->subject("New message from {$sender}")
            ->greeting('You have a new message')
            ->line("{$sender}: {$this->snippet()}")
            ->line('Open Prossignment to reply.');
    }

    private function snippet(): string
    {
        if ($this->message->body !== null && $this->message->body !== '') {
            return mb_substr($this->message->body, 0, 80);
        }

        return 'Shared a file: '.($this->message->original_name ?? 'File');
    }
}
