<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ChatMessageType;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single direct-chat message: text and/or one attachment (file/voice/image/
 * video) stored on a private disk and served via an authorized download route.
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

    protected function casts(): array
    {
        return [
            'type' => ChatMessageType::class,
            'size' => 'integer',
        ];
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
