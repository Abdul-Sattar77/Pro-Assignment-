<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ChatMessageType;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * A single direct-chat message with soft-delete audit support.
 *
 * @property ChatMessageType $type
 * @property string|null $path
 * @property string|null $original_name
 * @property int|null $size
 */
#[Fillable([
    'conversation_id', 'sender_id', 'type', 'body',
    'disk', 'path', 'original_name', 'mime_type', 'size',
])]
class ChatMessage extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => ChatMessageType::class,
            'size' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['conversation_id', 'sender_id', 'type', 'body', 'original_name'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('chat_message');
    }

    /** @return BelongsTo<ChatConversation, $this> */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
