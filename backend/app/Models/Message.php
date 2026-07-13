<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int         $id
 * @property string      $uuid
 * @property int         $conversation_id
 * @property int|null    $sender_id
 * @property string|null $message
 * @property int|null    $attachment_id
 * @property string      $message_type
 * @property bool        $is_deleted
 * @property int|null    $deleted_by
 * @property Carbon|null $created_at
 */
#[Fillable(['conversation_id', 'sender_id', 'message', 'attachment_id', 'message_type', 'is_deleted', 'deleted_by', 'created_at'])]
class Message extends Model
{
    use HasUuid;

    // We only use standard created_at, no updated_at for messages.
    public $timestamps = false;

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_deleted' => 'boolean',
        'created_at' => 'datetime',
    ];

    /** @return BelongsTo<Conversation, $this> */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<File, $this> */
    public function attachment(): BelongsTo
    {
        return $this->belongsTo(File::class, 'attachment_id');
    }

    /** @return BelongsTo<User, $this> */
    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
