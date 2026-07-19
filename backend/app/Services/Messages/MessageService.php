<?php

declare(strict_types=1);

namespace App\Services\Messages;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class MessageService
{
    public function __construct(
        private readonly ConversationRepositoryInterface $conversations,
        private readonly MessageRepositoryInterface $messages,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly FileRepositoryInterface $files,
    ) {}

    /**
     * Send a message to a conversation. Creates conversation if missing.
     *
     * @param  array{assignmentId: string, type: string, message?: string|null, attachmentId?: string|null}  $data
     */
    public function sendMessage(User $sender, array $data): Message
    {
        return DB::transaction(function () use ($sender, $data): Message {
            $assignment = $this->assignments->findByUuid($data['assignmentId']);
            if ($assignment === null) {
                throw new \InvalidArgumentException('The specified assignment does not exist.');
            }

            // Find or create the conversation for this assignment and type
            $conversation = Conversation::query()
                ->where('assignment_id', $assignment->getKey())
                ->where('type', $data['type'])
                ->first();

            if ($conversation === null) {
                $conversation = $this->conversations->create([
                    'assignment_id' => $assignment->getKey(),
                    'type' => $data['type'],
                    'created_by' => $sender->getKey(),
                ]);
            }

            // Resolve attachment details
            $attachmentId = null;
            $messageType = 'text';

            if (is_string($data['attachmentId'] ?? null) && $data['attachmentId'] !== '') {
                $file = $this->files->findByUuid($data['attachmentId']);
                if ($file !== null) {
                    $attachmentId = $file->getKey();
                    $messageType = str_starts_with($file->mime_type, 'image/') ? 'image' : 'file';
                }
            }

            // Store message
            $message = $this->messages->create([
                'conversation_id' => $conversation->getKey(),
                'sender_id' => $sender->getKey(),
                'message' => $data['message'] ?? null,
                'attachment_id' => $attachmentId,
                'message_type' => $messageType,
                'is_deleted' => false,
                'created_at' => Carbon::now(),
            ]);

            // Auto-read for the sender
            $this->markAsRead($conversation, $sender);

            // Notify other participants (excluding sender)
            $this->notifyParticipants($conversation, $message, $sender->getKey());

            return $message;
        });
    }

    /**
     * Mark a conversation as read for a user.
     */
    public function markAsRead(Conversation $conversation, User $user): void
    {
        DB::table('conversation_participants')->updateOrInsert(
            [
                'conversation_id' => $conversation->getKey(),
                'user_id' => $user->getKey(),
            ],
            [
                'last_read_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        );
    }

    /**
     * Update/edit a message text.
     */
    public function updateMessage(Message $message, string $newText): Message
    {
        return DB::transaction(function () use ($message, $newText): Message {
            $message->update([
                'message' => $newText,
            ]);

            return $message;
        });
    }

    /**
     * Soft delete a message.
     */
    public function deleteMessage(Message $message, User $actor): Message
    {
        return DB::transaction(function () use ($message, $actor): Message {
            $message->update([
                'is_deleted' => true,
                'deleted_by' => $actor->getKey(),
            ]);

            return $message;
        });
    }

    /**
     * Dispatch database notifications to other conversation participants.
     */
    private function notifyParticipants(Conversation $conversation, Message $message, int $senderId): void
    {
        $assignment = $conversation->assignment;
        if ($assignment === null) {
            return;
        }

        $recipients = collect();

        // 1. Add Project Manager
        if ($assignment->project_manager_id !== null) {
            $recipients->push(User::find($assignment->project_manager_id));
        }

        // 2. Add Client or Writer depending on conversation channel
        if ($conversation->type === 'client' && $assignment->client_id !== null) {
            $recipients->push(User::find($assignment->client_id));
        } elseif ($conversation->type === 'writer' && $assignment->writer_id !== null) {
            $recipients->push(User::find($assignment->writer_id));
        }

        // 3. Add Admins
        $admins = User::whereHas('roles', function ($q): void {
            $q->where('name', 'admin');
        })->get();

        foreach ($admins as $admin) {
            $recipients->push($admin);
        }

        // Unique filter, exclude sender
        $notificationRecipients = $recipients
            ->filter(fn ($u) => $u !== null && $u->id !== $senderId)
            ->unique('id');

        foreach ($notificationRecipients as $recipient) {
            $recipient->notify(new NewMessageNotification($message));
        }
    }
}
