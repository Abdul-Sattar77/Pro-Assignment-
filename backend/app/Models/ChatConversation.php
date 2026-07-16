<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * A direct (1:1) chat conversation. Separate from per-assignment threads.
 *
 * @property int $id
 * @property string $type
 * @property Carbon|null $last_message_at
 */
#[Fillable(['type', 'created_by', 'last_message_at'])]
class ChatConversation extends Model
{
    use HasUuid;

    protected function casts(): array
    {
        return ['last_message_at' => 'datetime'];
    }

    /** @return BelongsToMany<User, $this> */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_participants', 'conversation_id', 'user_id')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    /** @return HasMany<ChatMessage, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id')->oldest('id');
    }

    /** @return HasOne<ChatMessage, $this> */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(ChatMessage::class, 'conversation_id')->latestOfMany();
    }
}
