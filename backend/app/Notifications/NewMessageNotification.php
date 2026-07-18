<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

final class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Message $message) {}

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
        $conversation = $this->message->conversation;
        $assignment = $conversation?->assignment;

        return [
            'messageId' => $this->message->uuid,
            'conversationId' => $conversation?->uuid,
            'assignmentId' => $assignment?->uuid,
            'assignmentTitle' => $assignment?->title,
            'senderName' => $this->message->sender?->name ?? 'System',
            'snippet' => $this->message->message_type === 'text'
                ? mb_substr((string) $this->message->message, 0, 80)
                : 'Shared a file: '.($this->message->attachment?->original_name ?? 'File'),
            'type' => 'new_message',
            'createdAt' => $this->message->created_at?->toIso8601String(),
        ];
    }
}
